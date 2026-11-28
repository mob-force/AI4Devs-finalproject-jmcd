#!/usr/bin/env node
// PreToolUse hook of the aaf-author agent. It limits file changes to Proposed ADRs and technical
// designs, their rows in the indexes and the prompt log. Exit code 2 blocks the call.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { targetPath } from '../shared/agent-request.mjs';

export const AGENT = 'aaf-author';

const DOCUMENT = /^docs\/(?:adr|architecture\/tdd)\/\d{4}-[a-z0-9-]+\.md$/;
const INDEX = /^docs\/(?:adr|architecture\/tdd)\/README\.md$/;
const PROMPT_LOG = /^prompts\/\d{4}-\d{2}-\d{2}-[A-Za-z0-9-]+\.md$/;
// Such as "| [0009](0009-slug.md) | Title | Proposed |".
const PROPOSED_ROW = /^\| \[(\d{4})\]\(\1-[a-z0-9-]+\.md\) \|[^|]*\| Proposed \|$/;

const WRITABLE = 'docs/adr/, docs/architecture/tdd/ (NNNN-<slug>.md and README.md) and prompts/';

// True when the document states a status and every status it states is Proposed.
function isProposed(text) {
  const statuses = [...text.matchAll(/^- \*\*Status:\*\*(.*)$/gm)];
  return statuses.length > 0 && statuses.every(([, status]) => status.trim() === 'Proposed');
}

// True when the two versions differ only in index rows of Proposed documents, and none was removed.
function onlyProposedRowsChange(before, after) {
  const rest = (text) => text.split('\n').filter((line) => !PROPOSED_ROW.test(line)).join('\n');
  const numbers = (text) => text.split('\n').map((line) => line.match(PROPOSED_ROW)?.[1]).filter(Boolean);
  const remaining = numbers(after);
  return rest(before) === rest(after) && numbers(before).every((number) => remaining.includes(number));
}

function readIfPresent(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// The file as it would be after the call, or null when that cannot be told.
function resultOf(toolName, input, before) {
  if (toolName === 'Write') return typeof input.content === 'string' ? input.content : null;
  const { old_string: from, new_string: to, replace_all: all } = input;
  if (typeof from !== 'string' || typeof to !== 'string') return null;
  if (from === '') return before ? null : to;
  if (!before?.includes(from)) return null;
  return all ? before.split(from).join(to) : before.replace(from, () => to);
}

// Returns why the call is blocked, or null when it is allowed.
export function blockReason(event, root) {
  // Calls made by other agents follow their own rules.
  if (event.agent_type && event.agent_type !== AGENT) return null;
  if (event.tool_name !== 'Write' && event.tool_name !== 'Edit') return `unexpected tool ${event.tool_name}.`;

  const input = event.tool_input ?? {};
  const path = targetPath(input, root);
  if (PROMPT_LOG.test(path)) return null;
  if (!DOCUMENT.test(path) && !INDEX.test(path)) return `this agent may only change ${WRITABLE}.`;

  const before = readIfPresent(join(root, path));
  const after = resultOf(event.tool_name, input, before);
  if (after === null) return `the change to ${path} could not be checked: old_string must match the file exactly.`;

  if (INDEX.test(path)) {
    return before !== null && onlyProposedRowsChange(before, after)
      ? null
      : `in ${path} this agent may only add or change the index rows of Proposed documents.`;
  }
  if (before !== null && !isProposed(before)) {
    return `${path} is not Proposed, so it cannot be changed. Write a new document that supersedes it.`;
  }
  return isProposed(after) ? null : `${path} must say "- **Status:** Proposed": only the person changes a status.`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let reason;
  try {
    const event = JSON.parse(readFileSync(0, 'utf8'));
    reason = blockReason(event, process.env.CLAUDE_PROJECT_DIR || event.cwd);
  } catch (error) {
    reason = `the hook could not check the call (${error.message}).`;
  }
  if (reason) {
    console.error(`Blocked: ${reason}`);
    process.exit(2);
  }
}
