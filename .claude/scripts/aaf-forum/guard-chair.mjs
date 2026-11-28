#!/usr/bin/env node
// PreToolUse hook of the aaf-chair agent. The only thing the agent may change is the review record
// of an existing ADR or technical design document. Exit code 2 blocks the call.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { targetPath } from '../shared/agent-request.mjs';

export const AGENT = 'aaf-chair';
export const RECORD_PATHS = 'docs/architecture/reviews/ADR-NNNN-review.md or TDD-NNNN-review.md';
const RECORD = /^docs\/architecture\/reviews\/(ADR|TDD)-(\d{4})-review\.md$/;
const DOCUMENT_FOLDERS = { ADR: 'docs/adr', TDD: 'docs/architecture/tdd' };

// Returns why the call is blocked, or null when it is allowed.
export function blockReason(event, root) {
  // Calls made by other agents, such as the reviewers, follow their own rules.
  if (event.agent_type && event.agent_type !== AGENT) return null;
  if (event.tool_name !== 'Write') return `unexpected tool ${event.tool_name}.`;

  const record = targetPath(event.tool_input, root)?.match(RECORD);
  if (!record) return `the only file this agent may write is a review record: ${RECORD_PATHS}.`;

  // The record has to name an existing document with the same type and number.
  const [, type, number] = record;
  const folder = DOCUMENT_FOLDERS[type];
  const document = String(event.tool_input.content).match(/^\*\*Document:\*\* (\S+)[ \t]*$/m)?.[1] ?? '';
  const name = document.startsWith(`${folder}/`) ? document.slice(folder.length + 1) : '';
  return new RegExp(`^${number}-[\\w.-]+\\.md$`).test(name) && existsSync(join(root, document))
    ? null
    : `this record needs the line "**Document:** ${folder}/${number}-<slug>.md", naming an existing file.`;
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
