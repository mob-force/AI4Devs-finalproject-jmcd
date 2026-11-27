import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { AGENT, blockReason } from './guard-chair.mjs';

const root = mkdtempSync(join(tmpdir(), 'kyp-aaf-'));
after(() => rmSync(root, { recursive: true, force: true }));

const ADR = 'docs/adr/0007-layering.md';
const TDD = 'docs/architecture/tdd/0001-package-view.md';
for (const path of [ADR, TDD, 'docs/adr/README.md']) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), 'text\n');
}

const ADR_RECORD = 'docs/architecture/reviews/ADR-0007-review.md';
const TDD_RECORD = 'docs/architecture/reviews/TDD-0001-review.md';
const record = (document) => `# AAF review record\n\n**Document:** ${document}\n\n**Verdict:** Accepted\n`;
const write = (path, content, extra = {}) =>
  blockReason({ tool_name: 'Write', tool_input: { file_path: join(root, path), content }, ...extra }, root);

test('the review record of an existing ADR or design can be written', () => {
  assert.equal(write(ADR_RECORD, record(ADR)), null);
  assert.equal(write(TDD_RECORD, record(TDD)), null);
  assert.equal(write(ADR_RECORD, record(ADR), { agent_type: AGENT }), null);
});

test('no other file can be written', () => {
  for (const path of [ADR, TDD, 'AGENTS.md', 'docs/adr/README.md', '.claude/agents/aaf-chair.md',
    '.claude/scripts/aaf-forum/guard-chair.mjs', 'docs/architecture/reviews/README.md',
    'docs/architecture/reviews/ADR-7-review.md', 'docs/architecture/reviews/ADR-0007-review.md.bak',
    'docs/architecture/reviews/old/ADR-0007-review.md', 'docs/architecture/reviews/../ADR-0007-review.md',
    'docs/ADR-0007-review.md', '../ADR-0007-review.md']) {
    assert.notEqual(write(path, record(ADR)), null, path);
  }
  assert.notEqual(blockReason({ tool_name: 'Write', tool_input: { content: record(ADR) } }, root), null);
});

test('the record has to name the existing document it is about', () => {
  for (const content of [
    'no document line',
    undefined,
    record(TDD),
    record('docs/adr/0008-other.md'),
    record('docs/adr/0007-missing.md'),
    record('docs/adr/README.md'),
    record(`\`${ADR}\``),
    record(join(root, ADR)),
    record('docs/adr/0007-x/../0007-layering.md'),
  ]) {
    assert.notEqual(write(ADR_RECORD, content), null, String(content));
  }
});

test('editing and shell tools are blocked', () => {
  const input = { file_path: join(root, ADR_RECORD), command: 'ls' };
  for (const tool_name of ['Edit', 'Bash']) {
    assert.notEqual(blockReason({ tool_name, tool_input: input, agent_type: AGENT }, root), null, tool_name);
  }
});

test('calls of other agents are left to their own rules', () => {
  const event = { tool_name: 'Write', tool_input: { file_path: join(root, ADR) } };
  assert.equal(blockReason({ ...event, agent_type: 'aaf-author' }, root), null);
  assert.notEqual(blockReason({ ...event, agent_type: AGENT }, root), null);
});

test('the hook exits with 2 when it blocks or cannot read its input', () => {
  const script = fileURLToPath(new URL('./guard-chair.mjs', import.meta.url));
  const exit = (input) => spawnSync('node', [script], { input, env: { ...process.env, CLAUDE_PROJECT_DIR: root } }).status;
  const event = (path) =>
    JSON.stringify({ tool_name: 'Write', tool_input: { file_path: join(root, path), content: record(ADR) } });
  assert.equal(exit(event(ADR_RECORD)), 0);
  assert.equal(exit(event(ADR)), 2);
  assert.equal(exit('not json'), 2);
});

test('the chair definition has the pinned model, only these tools and the hook', () => {
  const definition = readFileSync(new URL('../../agents/aaf-chair.md', import.meta.url), 'utf8');
  const frontmatter = definition.split('---\n')[1];
  assert.match(frontmatter, /^name: aaf-chair$/m);
  assert.match(frontmatter, /^tools: Read, Grep, Glob, Write$/m);
  assert.match(frontmatter, /^model: claude-opus-5-5$/m);
  assert.match(frontmatter, /matcher: "Bash\|Write\|Edit"/);
  assert.match(frontmatter, /scripts\/aaf-forum\/guard-chair\.mjs" \|\| exit 2/);
});
