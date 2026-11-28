import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const REVIEWERS = ['aaf-api', 'aaf-data', 'aaf-platform', 'aaf-security', 'aaf-skeptic'];
const CONTRACT = 'docs/architecture/review-contract.md';

const read = (path) => readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8');

function definition(name) {
  const [, header, body] = read(`.claude/agents/${name}.md`).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fields = Object.fromEntries(header.split('\n').map((line) => line.match(/^([^:]+): (.*)$/).slice(1)));
  return { fields, body };
}

test('each reviewer is read-only and runs on its pinned model', () => {
  for (const name of REVIEWERS) {
    const { fields } = definition(name);
    // Any other field, such as `memory` or `hooks`, could widen what the agent can do.
    assert.deepEqual(Object.keys(fields), ['name', 'description', 'tools', 'model', 'effort'], name);
    assert.equal(fields.name, name);
    assert.equal(fields.tools, 'Read, Grep, Glob', name);
    assert.equal(fields.model, 'claude-opus-5-5', name);
  }
});

test('each reviewer refers to the one review contract without copying it', () => {
  const contract = read(CONTRACT);
  const sentences = contract.split('\n').filter((line) => line.length > 60);
  for (const name of REVIEWERS) {
    const { body } = definition(name);
    assert.ok(body.includes(`read \`${CONTRACT}\` and follow it`), name);
    for (const part of ['## AAF review', 'Left to development', 'Blocker', ...sentences]) {
      assert.equal(body.includes(part), false, `${name} repeats: ${part}`);
    }
  }
});

test('the contract names only reviewers that exist, and all of them', () => {
  const defined = readdirSync(new URL('../../agents/', import.meta.url))
    .map((file) => file.replace(/\.md$/, ''));
  for (const name of REVIEWERS) assert.ok(defined.includes(name), name);
  const named = new Set(read(CONTRACT).match(/\baaf-[a-z]+\b(?!-)/g).filter((name) => name !== 'aaf-reviewers'));
  assert.deepEqual([...named].sort(), REVIEWERS);
});
