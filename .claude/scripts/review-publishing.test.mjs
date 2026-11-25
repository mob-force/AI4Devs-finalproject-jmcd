import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { FIRST_LINE, LAST_LINE, isAllowed } from './guard-review-bash.mjs';
import { buildReview, commentableLines, neutralizeMentions, parseReport, parseRepository } from './publish-review.mjs';

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

test('findings go on their line when possible and in the summary otherwise', () => {
  const findings = [finding(), finding({ id: 'F2', line: 40 }), finding({ id: 'F3', line: null })];
  const diff = new Map([['docs/product/prd.md', new Set([3])]]);
  const { payload, unplaced } = buildReview(parseReport(report({ findings })), diff, 'abc');
  assert.equal(payload.event, 'COMMENT');
  assert.equal(payload.commit_id, 'abc');
  assert.deepEqual(payload.comments.map((c) => [c.path, c.line, c.side]), [['docs/product/prd.md', 3, 'RIGHT']]);
  assert.equal(unplaced, 2);
  assert.match(payload.body, /F2 · major/);
  assert.match(payload.body, /F3 · major/);
  assert.doesNotMatch(payload.body, /F1 · major/);
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
