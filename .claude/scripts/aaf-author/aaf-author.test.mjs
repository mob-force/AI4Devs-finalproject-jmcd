import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { blockReason } from './guard-aaf-author.mjs';

const root = mkdtempSync(join(tmpdir(), 'kyp-aaf-'));
after(() => rmSync(root, { recursive: true, force: true }));

const write = (path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const call = (tool_name, path, input, extra = {}) =>
  blockReason({ tool_name, tool_input: { file_path: path.startsWith('/') ? path : `${root}/${path}`, ...input }, ...extra }, root);
const writes = (path, content) => call('Write', path, { content }) === null;
const edits = (path, old_string, new_string, more = {}) =>
  call('Edit', path, { old_string, new_string, ...more }) === null;

const document = (status, body = 'text') => `# Title\n\n- **Status:** ${status}\n\n## Context\n\n${body}\n`;
const FOLDERS = ['docs/adr', 'docs/architecture/tdd'];

test('only designs, their indexes and prompt logs can be written', () => {
  for (const path of ['docs/adr/0100-new.md', 'docs/architecture/tdd/0001-new.md']) {
    assert.equal(writes(path, document('Proposed')), true, path);
  }
  assert.equal(writes('prompts/2026-11-28-aaf-design.md', 'log\n'), true);
  for (const path of ['AGENTS.md', 'readme.md', 'prompts.md', 'package.json', '.claude/agents/aaf-author.md',
    '.claude/scripts/aaf-author/guard-aaf-author.mjs', 'docs/agents/aaf-author.md', 'docs/product/idea.md',
    'docs/architecture/principles/patterns.md', 'docs/architecture/reviews/TDD-0001-review.md',
    'docs/adr/notes.md', 'docs/adr/0100-new.sh', 'docs/adr/readme.md', 'docs/architecture/tdd/sub/0001-new.md',
    'docs/architecture/tdd/../principles/0001-new.md', 'prompts/notes.md', '../0001-outside.md', '/etc/hosts']) {
    assert.notEqual(call('Write', path, { content: document('Proposed') }), null, path);
  }
});

test('a new document must be Proposed', () => {
  for (const folder of FOLDERS) {
    const path = `${folder}/0101-new.md`;
    assert.equal(writes(path, document('Adopted')), false);
    assert.equal(writes(path, '# Title without a status\n'), false);
    assert.equal(writes(path, `${document('Proposed')}- **Status:** Adopted\n`), false);
    assert.equal(edits(path, '', document('Proposed')), true);
    assert.equal(edits(path, '', document('Adopted')), false);
  }
});

test('a Proposed document can be revised but not adopted', () => {
  for (const folder of FOLDERS) {
    const path = `${folder}/0102-draft.md`;
    write(path, document('Proposed', 'old text, old text'));
    assert.equal(edits(path, 'old text', 'new $& text'), true);
    assert.equal(edits(path, 'old', 'new', { replace_all: true }), true);
    assert.equal(writes(path, document('Proposed', 'rewritten')), true);
    assert.equal(edits(path, 'Proposed', 'Adopted'), false);
    assert.equal(edits(path, '- **Status:** Proposed\n', ''), false);
    assert.equal(writes(path, document('Superseded by 0103')), false);
    assert.equal(edits(path, 'not in the file', 'x'), false);
    assert.equal(edits(path, '', 'x'), false);
  }
});

test('a document that is not Proposed cannot be changed', () => {
  for (const status of ['Adopted', 'Superseded by 0104']) {
    const path = 'docs/adr/0103-settled.md';
    write(path, document(status));
    assert.equal(edits(path, 'text', 'new text'), false, status);
    assert.equal(writes(path, document('Proposed')), false, status);
  }
});

const row = (number, title, status) => `| [${number}](${number}-slug.md) | ${title} | ${status} |`;

test('in an index only rows of Proposed documents change', () => {
  for (const folder of FOLDERS) {
    const path = `${folder}/README.md`;
    assert.equal(writes(path, 'new index\n'), false, 'the index file itself is not the agent\'s to create');

    const adopted = row('0001', 'First', 'Adopted');
    const draft = row('0002', 'Second', 'Proposed');
    const index = `# Rules\n\nKeep them.\n\n| ADR | Title | Status |\n|---|---|---|\n${adopted}\n${draft}\n`;
    write(path, index);
    const added = row('0003', 'Third', 'Proposed');
    assert.equal(edits(path, `${draft}\n`, `${draft}\n${added}\n`), true);
    assert.equal(writes(path, `${index}${added}\n`), true);
    assert.equal(edits(path, 'Second', 'Second, renamed'), true);

    assert.equal(edits(path, `${draft}\n`, `${draft}\n${row('0003', 'Third', 'Adopted')}\n`), false);
    assert.equal(edits(path, draft, row('0002', 'Second', 'Adopted')), false);
    assert.equal(edits(path, `${draft}\n`, ''), false);
    assert.equal(edits(path, adopted, row('0001', 'First', 'Proposed')), false);
    assert.equal(edits(path, 'First', 'Renamed'), false);
    assert.equal(edits(path, `${adopted}\n`, ''), false);
    assert.equal(edits(path, 'Keep them.', 'Ignore them.'), false);
  }
});

test('the real indexes accept a new row', () => {
  for (const folder of FOLDERS) {
    const path = `${folder}/README.md`;
    const index = readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8');
    write(path, index);
    assert.equal(writes(path, `${index}${row('0999', 'New', 'Proposed')}\n`), true, path);
    assert.equal(writes(path, `${index}${row('0999', 'New', 'Adopted')}\n`), false, path);
  }
});

test('other tools are refused and other agents are left to their own rules', () => {
  assert.notEqual(call('Bash', 'x', { command: 'ls' }), null);
  const content = { content: 'x' };
  assert.equal(call('Write', 'AGENTS.md', content, { agent_type: 'product-owner' }), null);
  assert.notEqual(call('Write', 'AGENTS.md', content, { agent_type: 'aaf-author' }), null);
});

test('the hook exits with 2 when it blocks or cannot read its input', () => {
  const script = fileURLToPath(new URL('./guard-aaf-author.mjs', import.meta.url));
  const exit = (input) => spawnSync('node', [script], { input, env: { ...process.env, CLAUDE_PROJECT_DIR: root } }).status;
  const request = (path) =>
    JSON.stringify({ tool_name: 'Write', tool_input: { file_path: `${root}/${path}`, content: document('Proposed') } });
  assert.equal(exit(request('docs/adr/0105-new.md')), 0);
  assert.equal(exit(request('AGENTS.md')), 2);
  assert.equal(exit('not json'), 2);
});
