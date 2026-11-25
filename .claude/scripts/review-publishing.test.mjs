import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { FIRST_LINE, LAST_LINE, isAllowed } from './guard-review-bash.mjs';
import {
  commentableLines,
  neutralizeMentions,
  parseReport,
  parseRepository,
  placeFindings,
  postReview,
  reviewPayload,
} from './publish-review.mjs';

const finding = (overrides = {}) => ({
  id: 'F1',
  severity: 'major',
  file: 'docs/product/prd.md',
  line: 3,
  section: 'Goal',
  problem: 'Not measurable.',
  proof: [{ type: 'quote', file: 'docs/product/prd.md', line: 3, text: 'must be fast' }],
  suggestion: 'Add a threshold.',
  ...overrides,
});

const report = (data = {}) => {
  const json = {
    verdict: 'changes_suggested',
    model: 'claude-opus-5-5',
    documents: ['docs/product/prd.md'],
    findings: [finding()],
    ...data,
  };
  return `## Product review: Changes suggested\n\nSummary.\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``;
};

const command = (...body) => ({ command: [FIRST_LINE, ...body, LAST_LINE].join('\n') });

test('guard allows only the publishing command', () => {
  assert.equal(isAllowed(command('## Product review: Agree', '$(touch x) `touch y`')), true);
  assert.equal(isAllowed({ command: `${command('report').command}\n` }), true);
});

test('guard blocks anything else', () => {
  const blocked = [
    { command: 'echo guard-test' },
    { command: 'node .claude/scripts/publish-review.mjs' },
    { command: FIRST_LINE.replace("'KYP_REVIEW'", 'KYP_REVIEW') + '\n$(touch x)\nKYP_REVIEW' },
    { command: `${command('report').command}\ntouch x` },
    command('report', LAST_LINE, 'touch x'),
    { command: [`${FIRST_LINE}; touch x`, 'report', LAST_LINE].join('\n') },
    { command: [`touch x && ${FIRST_LINE}`, 'report', LAST_LINE].join('\n') },
    { ...command('report'), dangerouslyDisableSandbox: true },
    {},
  ];
  for (const input of blocked) assert.equal(isAllowed(input), false, JSON.stringify(input));
});

test('guard hook exits with 2 when it blocks or cannot read its input', () => {
  const script = fileURLToPath(new URL('./guard-review-bash.mjs', import.meta.url));
  const exit = (input) => spawnSync('node', [script], { input }).status;
  assert.equal(exit(JSON.stringify({ tool_input: command('report') })), 0);
  assert.equal(exit(JSON.stringify({ tool_input: { command: 'ls' } })), 2);
  assert.equal(exit('not json'), 2);
});

test('a complete report parses', () => {
  const { summary, data } = parseReport(report());
  assert.match(summary, /^## Product review/);
  assert.equal(data.findings.length, 1);
});

test('reports without proof or with an inconsistent verdict are rejected', () => {
  assert.throws(() => parseReport(report({ findings: [finding({ proof: [] })] })), /no proof/);
  assert.throws(() => parseReport(report({ verdict: 'agree' })), /requires changes_suggested/);
  assert.throws(() => parseReport(report({ findings: [] })), /needs a blocker/);
  assert.throws(() => parseReport('no report here'), /no fenced json block/);
});

test('an open earlier finding keeps changes_suggested', () => {
  const text = report({ findings: [], previous_findings: [{ id: 'F1', status: 'open', reason: 'Still true.' }] });
  assert.doesNotThrow(() => parseReport(text));
});

test('only added and context lines of the diff accept comments', () => {
  const patch = '@@ -1,3 +1,3 @@\n a\n-b\n+B\n c\n@@ -10,0 +11,2 @@\n+d\n+e\n\\ No newline at end of file';
  assert.deepEqual([...commentableLines(patch)], [1, 2, 3, 11, 12]);
});

const doc = 'docs/product/prd.md';
const mixed = [
  finding({ id: 'F1' }), // changed line
  finding({ id: 'F2', line: 40 }), // file in the diff, line outside it
  finding({ id: 'F3', line: null }), // file in the diff, no line
  finding({ id: 'F4', file: 'docs/product/idea.md' }), // file not in the diff
];
const diff = new Map([[doc, new Set([3])]]);
const ids = (findings) => findings.map((f) => f.id);

// Runs postReview against a fake API. `fails` decides which calls GitHub refuses.
function post({ findings = mixed, stale, fails = () => false } = {}) {
  const parsed = parseReport(report({ findings }));
  const calls = [];
  const send = (method, path, body) => {
    calls.push({ method, path, body });
    if (fails({ method, path, body })) throw new Error('gh api failed: Validation Failed (HTTP 422)');
    return { id: 7, html_url: 'https://example.test/review' };
  };
  const placed = placeFindings(parsed.data.findings, diff, stale);
  const result = postReview({ report: parsed, placed, commitId: 'abc', stale, send });
  return { calls, result };
}

// Every finding must appear in a line comment, a file comment or in full in the last summary posted.
function visible(calls, fails = () => false) {
  const accepted = calls.filter((call) => !fails(call));
  const summary = accepted.filter((call) => call.path.startsWith('reviews')).at(-1);
  const comments = accepted.filter((call) => call.path === 'comments').map((call) => call.body.body);
  const inline = accepted.flatMap((call) => call.body.comments ?? []).map((c) => c.body);
  const texts = [summary.body.body, ...comments, ...inline].join('\n');
  return ids(mixed).filter((id) => texts.includes(`**${id} · major**`));
}

test('findings go on the line, else on the file, else in the summary', () => {
  const placed = placeFindings(mixed, diff);
  assert.deepEqual(ids(placed.line), ['F1']);
  assert.deepEqual(ids(placed.file), ['F2', 'F3']);
  assert.deepEqual(ids(placed.summary), ['F4']);
});

test('findings about a file that differs from the pull request go in the summary with a warning', () => {
  const stale = new Set([doc]);
  const placed = placeFindings(mixed, diff, stale);
  assert.deepEqual(ids(placed.summary), ['F1', 'F2', 'F3', 'F4']);
  const { body, comments } = reviewPayload(parseReport(report({ findings: mixed })), placed, 'abc', stale);
  assert.equal(comments.length, 0);
  assert.match(body, /Warning:.*prd\.md/);
});

test('a review posts the summary, line comments and file comments', () => {
  const { calls, result } = post();
  assert.deepEqual(calls.map((c) => `${c.method} ${c.path}`), ['POST reviews', 'POST comments', 'POST comments']);
  assert.equal(calls[0].body.event, 'COMMENT');
  assert.deepEqual(calls[0].body.comments.map((c) => [c.path, c.line, c.side]), [[doc, 3, 'RIGHT']]);
  assert.equal(calls[1].body.subject_type, 'file');
  assert.deepEqual(result.counts, { line: 1, file: 2, summary: 1 });
  assert.deepEqual(visible(calls), ids(mixed));
});

test('refused line comments move to the summary', () => {
  const fails = (call) => call.body.comments?.length > 0;
  const { calls, result } = post({ fails });
  assert.deepEqual(result.counts, { line: 0, file: 2, summary: 2 });
  assert.deepEqual(visible(calls, fails), ids(mixed));
});

test('refused file comments are added to the summary', () => {
  const fails = (call) => call.path === 'comments';
  const { calls, result } = post({ fails });
  assert.equal(calls.at(-1).method, 'PUT');
  assert.equal(calls.at(-1).path, 'reviews/7');
  assert.deepEqual(result.counts, { line: 1, file: 0, summary: 3 });
  assert.deepEqual(visible(calls, fails), ids(mixed));
});

test('findings that cannot be added to the summary are reported as missing', () => {
  const { result } = post({ fails: (call) => call.path === 'comments' || call.method === 'PUT' });
  assert.match(result.missing, /F2, F3/);
});

test('mentions are neutralized', () => {
  assert.equal(neutralizeMentions('@someone and `@types`'), '@​someone and `@​types`');
  assert.equal(neutralizeMentions('a@b.com'), 'a@b.com');
});

test('the repository comes from the origin remote', () => {
  assert.equal(parseRepository('git@github.com:org/repo.git'), 'org/repo');
  assert.equal(parseRepository('https://github.com/org/repo'), 'org/repo');
  assert.throws(() => parseRepository('git@example.com:org/repo.git'));
});
