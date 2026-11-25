#!/usr/bin/env node
// The git and GitHub steps of the product-owner agent. It takes the JSON request in
// .agent-tmp/po-request.json, checks that the step is safe, runs it and prints the outcome.
// Anything unexpected prints "STOPPED:".
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { FOOTER, neutralizeMentions, parseRepository } from '../product-review/publish-review.mjs';
import { PO_REQUEST, takeRequest } from '../shared/agent-request.mjs';
import { PRODUCT_PATHS, isProductPath } from './paths.mjs';

const SCRIPT = '.claude/scripts/product-owner/workflow.mjs';
const TYPES = 'feat|fix|chore|docs|refactor|test|build|ci|perf|style|revert';
const BRANCH = new RegExp(`^(?:${TYPES})/(KYP-\\d+)-[A-Za-z0-9][A-Za-z0-9-]*$`);

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, input) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trimEnd();
  } catch (error) {
    const detail = [error.stderr, error.stdout].map((part) => part?.toString().trim()).filter(Boolean).join('\n');
    throw new Error(`${command} ${args[0]} failed: ${detail || error.message}`);
  }
}

const git = (...args) => run('git', ['-c', 'core.quotepath=false', ...args]);
const lines = (text) => text.split('\n').filter(Boolean);
const repository = () => parseRepository(git('config', '--get', 'remote.origin.url'));

const openPulls = () =>
  JSON.parse(
    run('gh', ['pr', 'list', '--repo', repository(), '--state', 'open', '--limit', '100',
      '--json', 'number,url,headRefName,headRefOid,isCrossRepository']),
  ).filter((pull) => !pull.isCrossRepository);

// Changed tracked files, and new files the agent could commit. Other untracked files are left alone.
function uncommitted() {
  return lines(git('status', '--porcelain', '--untracked-files=all')).filter(
    (row) => !row.startsWith('??') || isProductPath(row.slice(3)),
  );
}

function checkClean() {
  const changes = uncommitted();
  check(changes.length === 0, `the working tree has uncommitted changes:\n${changes.join('\n')}`);
}

function taskBranch() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const match = branch.match(BRANCH);
  check(match, `"${branch}" is not a task branch`);
  return { branch, key: match[1] };
}

function checkHeader(header, key, what) {
  check(
    new RegExp(`^(?:${TYPES})\\(${key}\\)!?: \\S`).test(header ?? ''),
    `the ${what} must look like "docs(${key}): description"`,
  );
}

function checkStart({ key, branch }) {
  check(/^KYP-\d+$/.test(key ?? ''), 'key must look like KYP-8');
  check(branch?.match(BRANCH)?.[1] === key, `branch must look like docs/${key}-short-description`);
  checkClean();
  git('fetch', '--prune', 'origin');
  const sameTask = new RegExp(`/${key}(-|$)`);

  const pull = openPulls().find((candidate) => sameTask.test(candidate.headRefName));
  check(!pull, `a pull request for ${key} already exists: ${pull?.url}`);
  const existing = lines(git('for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes/origin'))
    .filter((name) => sameTask.test(name));
  check(existing.length === 0, `a branch for ${key} already exists: ${existing.join(', ')}`);
  try {
    git('cat-file', '-e', `origin/main:${SCRIPT}`);
  } catch {
    throw new Error('this workflow is not on origin/main yet, so a branch created from it could not continue');
  }
}

const actions = {
  check(request) {
    checkStart(request);
    return `OK: ${request.key} can start on ${request.branch}`;
  },

  start(request) {
    checkStart(request);
    git('switch', '--no-track', '-c', request.branch, 'origin/main');
    git('push', '--set-upstream', 'origin', request.branch);
    return `STARTED: ${request.branch} created from origin/main and pushed to GitHub`;
  },

  commit({ message, files }) {
    const { key } = taskBranch();
    checkHeader(message?.split('\n')[0], key, 'commit message');
    check(Array.isArray(files) && files.length > 0, 'files must list what to commit');
    const outside = files.filter((file) => !isProductPath(file));
    check(outside.length === 0, `only ${PRODUCT_PATHS} may be committed, not: ${outside.join(', ')}`);
    const staged = lines(git('diff', '--cached', '--name-only')).filter((file) => !files.includes(file));
    check(staged.length === 0, `other files are already staged: ${staged.join(', ')}`);
    git('--literal-pathspecs', 'add', '--', ...files);
    run('git', ['commit', '-F', '-'], message);
    return `COMMITTED: ${git('log', '-1', '--format=%h %s')}`;
  },

  deliver({ title, body }) {
    const { branch, key } = taskBranch();
    checkHeader(title, key, 'pull request title');
    check(typeof body === 'string' && body.trim() !== '', 'body is missing');
    checkClean();
    git('fetch', '--prune', 'origin');
    const changed = lines(git('diff', '--name-only', 'origin/main...HEAD'));
    check(changed.length > 0, 'there is nothing to deliver: the branch has no changes');
    const outside = changed.filter((file) => !isProductPath(file));
    check(outside.length === 0, `the branch changes files outside ${PRODUCT_PATHS}: ${outside.join(', ')}`);
    const existing = openPulls().find((pull) => pull.headRefName === branch);
    check(!existing, `a pull request for this branch already exists: ${existing?.url}`);

    git('push', '--set-upstream', 'origin', branch);
    const url = run(
      'gh',
      ['pr', 'create', '--repo', repository(), '--draft', '--base', 'main', '--head', branch,
        '--title', title, '--body-file', '-'],
      neutralizeMentions(body),
    );
    return `DELIVERED: draft pull request ${url}\nChanged files:\n${changed.join('\n')}`;
  },

  'verify-review'() {
    const { branch } = taskBranch();
    const pull = openPulls().find((candidate) => candidate.headRefName === branch);
    check(pull, `no open pull request for branch "${branch}"`);
    const review = lines(
      run('gh', ['api', '--paginate', `repos/${repository()}/pulls/${pull.number}/reviews`,
        '--jq', '.[] | {body, commit_id, html_url}']),
    )
      .map((row) => JSON.parse(row))
      .filter((item) => item.commit_id === pull.headRefOid && item.body?.includes(FOOTER))
      .at(-1);
    check(review, `the reviewer posted no review for the latest commit of ${pull.url}`);
    const verdict = review.body.match(/^## Product review: (Agree|Changes suggested|Not reviewed)/m)?.[1];
    check(verdict && verdict !== 'Not reviewed', `the review failed (verdict: ${verdict ?? 'missing'}): ${review.html_url}`);
    return `REVIEWED: ${verdict}, ${review.html_url}`;
  },
};

export function perform() {
  process.chdir(git('rev-parse', '--show-toplevel'));
  const text = takeRequest(process.cwd(), PO_REQUEST);
  let request;
  try {
    request = JSON.parse(text);
  } catch (error) {
    throw new Error(`the request is not valid JSON (${error.message})`);
  }
  check(Object.hasOwn(actions, request.action), `action must be one of ${Object.keys(actions).join(', ')}`);
  return actions[request.action](request);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    console.log(perform());
  } catch (error) {
    console.log(`STOPPED: ${error.message}`);
    process.exit(1);
  }
}
