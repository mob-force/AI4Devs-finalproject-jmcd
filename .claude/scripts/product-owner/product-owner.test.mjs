import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { FOOTER } from '../product-review/publish-review.mjs';
import { COMMAND, TRANSITION_TOOL, blockReason } from './guard-product-owner.mjs';
import { isProductPath } from './paths.mjs';

const ROOT = '/repo';
const blocked = (tool_name, tool_input, extra = {}) =>
  blockReason({ tool_name, tool_input, ...extra }, ROOT) !== null;

test('only product documentation can be written', () => {
  for (const path of ['readme.md', 'prompts.md', 'docs/product/prd.md', 'docs/adr/0005-x.md', 'prompts/a.md']) {
    assert.equal(isProductPath(path), true, path);
    assert.equal(blocked('Write', { file_path: `${ROOT}/${path}` }), false, path);
  }
  for (const path of ['AGENTS.md', 'package.json', '.claude/agents/product-owner.md', 'docs/agents/x.md',
    'docs/product/../../.claude/settings.json', '../outside.md', '/etc/hosts', 'docs/product']) {
    assert.equal(blocked('Edit', { file_path: path.startsWith('/') ? path : `${ROOT}/${path}` }), true, path);
  }
});

test('the shell is limited to the workflow script', () => {
  assert.equal(blocked('Bash', { command: COMMAND }), false);
  for (const other of ['gh pr merge 1', 'git push --force', `${COMMAND}\ngh pr ready 1`, `${COMMAND} merge`]) {
    assert.equal(blocked('Bash', { command: other }), true, other);
  }
  assert.equal(blocked('Write', { file_path: `${ROOT}/.agent-tmp/po-request.json` }), false);
  assert.equal(blocked('Write', { file_path: `${ROOT}/.agent-tmp/review-report.md` }), true);
});

test('only the reviewer can be started, with its own model', () => {
  const reviewer = { subagent_type: 'product-adversarial-reviewer', prompt: 'review' };
  assert.equal(blocked('Agent', reviewer), false);
  assert.equal(blocked('Agent', { ...reviewer, model: 'sonnet' }), true);
  assert.equal(blocked('Agent', { ...reviewer, isolation: 'worktree' }), true);
  assert.equal(blocked('Agent', { subagent_type: 'general-purpose' }), true);
});

test('Jira tasks can only move to In Progress', () => {
  const input = { cloudId: 'x', issueIdOrKey: 'KYP-8', transitionName: 'In Progress' };
  assert.equal(blocked(TRANSITION_TOOL, input), false);
  assert.equal(blocked(TRANSITION_TOOL, { ...input, transitionName: 'Done' }), true);
  assert.equal(blocked(TRANSITION_TOOL, { ...input, transitionId: '31' }), true);
  assert.equal(blocked(TRANSITION_TOOL, { ...input, issueIdOrKey: 'ABC-1' }), true);
});

test('calls of other agents are left to their own rules', () => {
  const input = { command: 'node .claude/scripts/product-review/publish-review.mjs' };
  assert.equal(blocked('Bash', input, { agent_type: 'product-adversarial-reviewer' }), false);
  assert.equal(blocked('Bash', input, { agent_type: 'product-owner' }), true);
});

test('the hook exits with 2 when it blocks or cannot read its input', () => {
  const script = fileURLToPath(new URL('./guard-product-owner.mjs', import.meta.url));
  const exit = (input) => spawnSync('node', [script], { input, env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT } }).status;
  assert.equal(exit(JSON.stringify({ tool_name: 'Write', tool_input: { file_path: `${ROOT}/readme.md` } })), 0);
  assert.equal(exit(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } })), 2);
  assert.equal(exit('not json'), 2);
});

// The workflow runs against throwaway repositories and a fake `gh`.
const sandbox = mkdtempSync(join(tmpdir(), 'kyp-po-'));
after(() => rmSync(sandbox, { recursive: true, force: true }));
const workflow = fileURLToPath(new URL('./workflow.mjs', import.meta.url));
let count = 0;

function setup({ pulls = [], reviews = [], onMain = true } = {}) {
  const base = join(sandbox, String(++count));
  const origin = join(base, 'origin.git');
  const repo = join(base, 'repo');
  const bin = join(base, 'bin');
  mkdirSync(bin, { recursive: true });
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: 'pipe' }).trim();
  const write = (path, text = 'text\n') => {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), text);
  };
  execFileSync('git', ['init', '--bare', '--initial-branch=main', origin], { stdio: 'pipe' });
  execFileSync('git', ['init', '--initial-branch=main', repo], { stdio: 'pipe' });
  for (const [name, value] of [['user.name', 'Test'], ['user.email', 'test@example.test'], ['commit.gpgsign', 'false'],
    ['core.hooksPath', '/dev/null'], ['remote.origin.url', 'git@github.com:org/repo.git'],
    ['remote.origin.fetch', '+refs/heads/*:refs/remotes/origin/*'],
    [`url.${origin}.insteadOf`, 'git@github.com:org/repo.git']]) {
    git('config', name, value);
  }
  write('readme.md');
  write('.gitignore', '.agent-tmp/\n');
  if (onMain) write('.claude/scripts/product-owner/workflow.mjs');
  git('add', '-A');
  git('commit', '-m', 'chore: init');
  git('push', 'origin', 'main');

  writeFileSync(join(base, 'pulls.json'), JSON.stringify(pulls));
  writeFileSync(
    join(bin, 'gh'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(join(base, 'gh.log'))}, JSON.stringify(args) + '\\n');
if (args[1] === 'list') console.log(fs.readFileSync(${JSON.stringify(join(base, 'pulls.json'))}, 'utf8'));
else if (args[1] === 'create') console.log('https://example.test/pull/9');
else for (const review of ${JSON.stringify(reviews)}) console.log(JSON.stringify(review));
`,
  );
  chmodSync(join(bin, 'gh'), 0o755);

  const run = () =>
    spawnSync('node', [workflow], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    }).stdout.trim();
  const act = (request) => {
    write('.agent-tmp/po-request.json', JSON.stringify(request));
    return run();
  };
  const ghCalls = () => readFileSync(join(base, 'gh.log'), 'utf8');
  return { act, run, git, write, ghCalls };
}

const task = { key: 'KYP-8', branch: 'docs/KYP-8-product-idea' };

test('a task is started, committed and delivered as a draft pull request', () => {
  const { act, git, write, ghCalls } = setup();
  assert.match(act({ action: 'check', ...task }), /^OK:/);
  assert.match(act({ action: 'start', ...task }), /^STARTED:/);
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), task.branch);
  assert.match(git('ls-remote', 'origin', task.branch), /KYP-8-product-idea/);

  write('docs/product/idea.md');
  assert.match(act({ action: 'deliver', title: 'docs(KYP-8): idea', body: 'b' }), /STOPPED: the working tree/);
  assert.match(
    act({ action: 'commit', message: 'docs(KYP-8): record the idea', files: ['docs/product/idea.md'] }),
    /^COMMITTED:/,
  );
  const delivered = act({ action: 'deliver', title: 'docs(KYP-8): record the idea', body: 'Summary' });
  assert.match(delivered, /^DELIVERED: draft pull request https:\/\/example\.test\/pull\/9/);
  assert.match(delivered, /docs\/product\/idea\.md/);
  assert.match(ghCalls(), /"create".*"--draft".*"--base","main"/);
});

test('uncommitted changes stop the start, unrelated untracked files do not', () => {
  const { act, write } = setup();
  write('.idea/workspace.xml');
  assert.match(act({ action: 'check', ...task }), /^OK:/);
  write('readme.md', 'changed\n');
  assert.match(act({ action: 'start', ...task }), /STOPPED: the working tree has uncommitted changes[\s\S]*readme\.md/);
});

test('an existing branch or pull request stops the start', () => {
  const withBranch = setup();
  withBranch.git('branch', 'chore/KYP-8-earlier');
  assert.match(withBranch.act({ action: 'start', ...task }), /STOPPED: a branch for KYP-8 already exists/);

  const withPull = setup({ pulls: [{ headRefName: 'docs/KYP-8-other', url: 'u', isCrossRepository: false }] });
  assert.match(withPull.act({ action: 'start', ...task }), /STOPPED: a pull request for KYP-8 already exists/);

  const otherTask = setup();
  otherTask.git('branch', 'docs/KYP-80-another');
  assert.match(otherTask.act({ action: 'check', ...task }), /^OK:/);
});

test('wrong requests and an unmerged workflow are refused', () => {
  const { act, git } = setup();
  assert.match(act({ action: 'merge' }), /STOPPED: action must be one of/);
  assert.match(act({ action: 'check', key: 'KYP-8', branch: 'docs/KYP-9-x' }), /STOPPED: branch must look like/);
  assert.match(act({ action: 'commit', message: 'docs(KYP-8): x', files: ['readme.md'] }), /STOPPED: "main" is not a task branch/);
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'main');
  assert.match(setup({ onMain: false }).act({ action: 'start', ...task }), /STOPPED: this workflow is not on origin\/main/);
});

test('a request is used once', () => {
  const { act, run } = setup();
  assert.match(act({ action: 'check', ...task }), /^OK:/);
  assert.match(run(), /STOPPED: there is no request/);
});

test('only product files with the task key can be committed', () => {
  const { act, write } = setup();
  act({ action: 'start', ...task });
  write('package.json');
  write('docs/product/idea.md');
  const commit = (message, files) => act({ action: 'commit', message, files });
  assert.match(commit('docs(KYP-8): x', ['package.json']), /STOPPED: only .* may be committed/);
  assert.match(commit('docs(KYP-9): x', ['docs/product/idea.md']), /STOPPED: the commit message/);
  assert.match(commit('added stuff', ['docs/product/idea.md']), /STOPPED: the commit message/);
});

test('the review must be on the latest commit and must not have failed', () => {
  const pulls = [{ number: 9, url: 'u', headRefName: task.branch, headRefOid: 'new', isCrossRepository: false }];
  const review = (verdict, commit_id = 'new') => ({
    body: `## Product review: ${verdict}\n\n${FOOTER}`,
    commit_id,
    html_url: 'https://example.test/review',
  });
  const verify = (reviews) => {
    const repo = setup({ pulls, reviews });
    repo.git('switch', '-c', task.branch);
    return repo.act({ action: 'verify-review' });
  };
  assert.match(verify([review('Agree')]), /^REVIEWED: Agree/);
  assert.match(verify([review('Changes suggested')]), /^REVIEWED: Changes suggested/);
  assert.match(verify([]), /STOPPED: the reviewer posted no review/);
  assert.match(verify([review('Agree', 'old')]), /STOPPED: the reviewer posted no review/);
  assert.match(verify([review('Not reviewed')]), /STOPPED: the review failed/);
});
