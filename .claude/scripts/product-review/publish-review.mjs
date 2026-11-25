#!/usr/bin/env node
// Publishes the Product Adversarial Reviewer report in .agent-tmp/review-report.md on the open pull
// request of the checked-out branch. Every finding has to be visible to whoever reviews the pull request, so it
// goes, in order of preference, on its line of the diff, on its file in the diff, or in full in the
// summary comment.
// REVIEW_DRY_RUN=1 prints what would be posted without posting it.
import { execFileSync } from 'node:child_process';
import { isAbsolute, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

import { REVIEW_REPORT, takeRequest } from '../shared/agent-request.mjs';

const VERDICTS = ['agree', 'changes_suggested', 'not_reviewed'];
const SEVERITIES = ['blocker', 'major', 'minor'];
const PROOF_TYPES = ['quote', 'scenario', 'external'];
const MAX_BODY = 65536;
export const FOOTER =
  '_Posted by the Product Adversarial Reviewer, an AI agent. These are suggestions for the product team to accept or argue against._';

const filled = (value) => typeof value === 'string' && value.trim() !== '';

function check(condition, message) {
  if (!condition) throw new Error(`invalid report: ${message}`);
}

export function parseReport(text) {
  const lines = text.split('\n');
  const start = lines.map((line) => line.trim()).lastIndexOf('```json');
  const end = lines.findIndex((line, index) => index > start && line.trim() === '```');
  check(start >= 0 && end > start, 'no fenced json block');

  const summary = lines.slice(0, start).join('\n').trim();
  check(summary.startsWith('## Product review:'), 'the summary must start with "## Product review:"');

  let data;
  try {
    data = JSON.parse(lines.slice(start + 1, end).join('\n'));
  } catch (error) {
    check(false, `the json block does not parse (${error.message})`);
  }

  check(VERDICTS.includes(data.verdict), `verdict must be one of ${VERDICTS.join(', ')}`);
  check(filled(data.model), 'model is missing');
  check(Array.isArray(data.documents) && data.documents.every(filled), 'documents must list paths');
  check(data.verdict === 'not_reviewed' || data.documents.length > 0, 'documents is empty');
  check(Array.isArray(data.findings), 'findings must be a list');

  for (const finding of data.findings) {
    const id = finding.id ?? '(no id)';
    check(filled(finding.id), 'a finding has no id');
    check(SEVERITIES.includes(finding.severity), `${id}: unknown severity`);
    check(filled(finding.problem), `${id}: problem is missing`);
    check(filled(finding.suggestion), `${id}: suggestion is missing`);
    check(Array.isArray(finding.proof) && finding.proof.length > 0, `${id}: has no proof`);
    for (const proof of finding.proof) {
      check(PROOF_TYPES.includes(proof.type) && filled(proof.text), `${id}: incomplete proof`);
      check(proof.type !== 'quote' || filled(proof.file), `${id}: a quote needs a file`);
      check(proof.type !== 'external' || filled(proof.url), `${id}: external proof needs a url`);
    }
  }

  const serious = data.findings.some((finding) => finding.severity !== 'minor');
  const stillOpen = (data.previous_findings ?? []).some((finding) => finding.status === 'open');
  check(!(serious && data.verdict !== 'changes_suggested'), 'a blocker or major finding requires changes_suggested');
  check(!(data.verdict === 'changes_suggested' && !serious && !stillOpen), 'changes_suggested needs a blocker, major or open finding');

  return { summary, data };
}

// Line numbers of the new file that GitHub accepts a comment on: added and context lines.
export function commentableLines(patch = '') {
  const result = new Set();
  let line = null;
  for (const row of patch.split('\n')) {
    const hunk = row.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) line = Number(hunk[1]);
    else if (line !== null && (row.startsWith('+') || row.startsWith(' '))) result.add(line++);
  }
  return result;
}

// Stops text taken from documents or web pages from notifying GitHub users.
export function neutralizeMentions(text) {
  return text.replace(/(^|[^A-Za-z0-9_])@(?=[A-Za-z0-9])/g, '$1@​');
}

function proofMarkdown(proof) {
  if (proof.type === 'quote') {
    const place = proof.line ? `${proof.file}:${proof.line}` : proof.file;
    return `- Quote, \`${place}\`: "${proof.text}"`;
  }
  if (proof.type === 'external') return `- Source ${proof.url}: ${proof.text}`;
  return `- Scenario: ${proof.text}`;
}

export function findingMarkdown(finding) {
  const place = [finding.file && `\`${finding.file}${finding.line ? `:${finding.line}` : ''}\``, finding.section]
    .filter(Boolean)
    .join(', ');
  return [
    `**${finding.id} · ${finding.severity}**${place ? ` · ${place}` : ''}`,
    finding.problem,
    `**Proof**\n${finding.proof.map(proofMarkdown).join('\n')}`,
    `**Suggestion:** ${finding.suggestion}`,
  ].join('\n\n');
}

// Decides where each finding goes. `diff` maps each file of the pull request to its commentable
// lines. Files in `stale` differ from the pull request, so their findings cannot be placed on it.
export function placeFindings(findings, diff, stale = new Set()) {
  const placed = { line: [], file: [], summary: [] };
  for (const finding of findings) {
    const lines = stale.has(finding.file) ? undefined : diff.get(finding.file);
    if (!lines) placed.summary.push(finding);
    else if (Number.isInteger(finding.line) && lines.has(finding.line)) placed.line.push(finding);
    else placed.file.push(finding);
  }
  return placed;
}

const commentBody = (finding) => limit(neutralizeMentions(findingMarkdown(finding)));

function limit(text) {
  if (text.length > MAX_BODY) throw new Error('the report is too long for a GitHub comment');
  return text;
}

export function summaryBody({ summary, data }, inSummary, stale = new Set()) {
  const sections = [summary];
  if (stale.size > 0) {
    const names = [...stale].map((file) => `\`${file}\``).join(', ');
    sections.push(
      `> **Warning:** ${names} differed from this pull request when reviewed (uncommitted or unpushed changes). Their findings are listed here only, and line numbers may not match.`,
    );
  }
  if (inSummary.length > 0) {
    sections.push(`### Findings not attached to the diff\n\n${inSummary.map(findingMarkdown).join('\n\n---\n\n')}`);
  }
  if (data.previous_findings?.length > 0) {
    const rows = data.previous_findings.map((f) => `- **${f.id}** ${f.status}: ${f.reason}`);
    sections.push(`### Earlier findings\n\n${rows.join('\n')}`);
  }
  sections.push(FOOTER);
  return limit(neutralizeMentions(sections.join('\n\n')));
}

export function reviewPayload(report, placed, commitId, stale) {
  return {
    commit_id: commitId,
    event: 'COMMENT',
    body: summaryBody(report, placed.summary, stale),
    comments: placed.line.map((finding) => ({
      path: finding.file,
      line: finding.line,
      side: 'RIGHT',
      body: commentBody(finding),
    })),
  };
}

export function filePayload(finding, commitId) {
  return { commit_id: commitId, path: finding.file, subject_type: 'file', body: commentBody(finding) };
}

// Posts the review first, so that the summary exists, then the file comments. Findings that GitHub
// refuses to attach to the diff are moved into the summary. `send(method, path, body)` calls the API
// under the pull request.
export function postReview({ report, placed, commitId, stale, send }) {
  let { line, summary } = placed;
  let review;
  try {
    review = send('POST', 'reviews', reviewPayload(report, placed, commitId, stale));
  } catch (error) {
    // 422 means GitHub rejected the content, so nothing was created and a retry cannot duplicate it.
    if (line.length === 0 || !error.message.includes('HTTP 422')) throw error;
    summary = [...summary, ...line];
    line = [];
    review = send('POST', 'reviews', reviewPayload(report, { line, summary }, commitId, stale));
  }

  const refused = [];
  let attached = 0;
  for (const finding of placed.file) {
    try {
      send('POST', 'comments', filePayload(finding, commitId));
      attached += 1;
    } catch {
      refused.push(finding);
    }
  }
  if (refused.length > 0) {
    summary = [...summary, ...refused];
    try {
      send('PUT', `reviews/${review.id}`, { body: summaryBody(report, summary, stale) });
    } catch (error) {
      const ids = refused.map((finding) => finding.id).join(', ');
      return { url: review.html_url, missing: `${ids} could not be posted (${error.message})` };
    }
  }
  return { url: review.html_url, counts: { line: line.length, file: attached, summary: summary.length } };
}

export function parseRepository(remoteUrl) {
  const match = remoteUrl.match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
  if (!match) throw new Error('the origin remote is not a GitHub repository');
  return `${match[1]}/${match[2]}`;
}

class PartialError extends Error {}

function run(command, args, input) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const detail = (error.stderr || error.stdout || error.message).toString().trim();
    throw new Error(`${command} ${args[0]} failed: ${detail}`);
  }
}

function publish() {
  const root = run('git', ['rev-parse', '--show-toplevel']);
  const report = parseReport(takeRequest(root, REVIEW_REPORT));
  const fromRoot = (path) => (path && isAbsolute(path) ? relative(root, path) : path?.replace(/^\.\//, ''));
  report.data.documents = report.data.documents.map(fromRoot);
  for (const finding of report.data.findings) finding.file = fromRoot(finding.file);

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch === 'HEAD') throw new Error('no branch is checked out');
  const repository = parseRepository(run('git', ['remote', 'get-url', 'origin']));

  const pulls = JSON.parse(
    run('gh', ['pr', 'list', '--repo', repository, '--head', branch, '--state', 'open',
      '--json', 'number,url,headRefOid,isCrossRepository']),
  ).filter((pull) => !pull.isCrossRepository);
  if (pulls.length === 0) throw new Error(`no open pull request for branch "${branch}"`);
  if (pulls.length > 1) throw new Error(`more than one open pull request for branch "${branch}"`);
  const [pull] = pulls;

  // Findings can only be attached to the diff if the reviewed file is the one in the pull request.
  const reviewed = new Set(
    report.data.verdict === 'not_reviewed'
      ? []
      : [...report.data.documents, ...report.data.findings.map((finding) => finding.file).filter(Boolean)],
  );
  const stale = new Set(
    [...reviewed].filter((file) => {
      try {
        return (
          run('git', ['-C', root, 'rev-parse', '--verify', `${pull.headRefOid}:${file}`]) !==
          run('git', ['-C', root, 'hash-object', '--', file])
        );
      } catch {
        return true;
      }
    }),
  );

  const files = run('gh', ['api', '--paginate', `repos/${repository}/pulls/${pull.number}/files`,
    '--jq', '.[] | {filename, patch}']);
  const diffLines = new Map(
    files.split('\n').filter(Boolean).map((row) => {
      const file = JSON.parse(row);
      return [file.filename, commentableLines(file.patch ?? '')];
    }),
  );

  const placed = placeFindings(report.data.findings, diffLines, stale);
  const commitId = pull.headRefOid;
  const describe = (counts) =>
    `${counts.line} line comments, ${counts.file} file comments, ${counts.summary} findings in the summary only` +
    (stale.size > 0 ? `; WARNING: differs from the pull request: ${[...stale].join(', ')}` : '');

  if (process.env.REVIEW_DRY_RUN) {
    const requests = {
      review: reviewPayload(report, placed, commitId, stale),
      fileComments: placed.file.map((finding) => filePayload(finding, commitId)),
    };
    const counts = { line: placed.line.length, file: placed.file.length, summary: placed.summary.length };
    return `DRY RUN, nothing posted: ${pull.url} (${describe(counts)})\n${JSON.stringify(requests, null, 2)}`;
  }

  const send = (method, path, body) =>
    JSON.parse(
      run('gh', ['api', '--method', method, `repos/${repository}/pulls/${pull.number}/${path}`, '--input', '-'],
        JSON.stringify(body)),
    );
  const result = postReview({ report, placed, commitId, stale, send });
  if (result.missing) throw new PartialError(`${result.url} (${result.missing})`);
  return `PUBLISHED: ${result.url} (${describe(result.counts)})`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    console.log(publish());
  } catch (error) {
    const status = error instanceof PartialError ? 'PARTIALLY PUBLISHED' : 'NOT PUBLISHED';
    console.log(`${status}: ${error.message}`);
    process.exit(1);
  }
}
