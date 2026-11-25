#!/usr/bin/env node
// PreToolUse hook of the product-adversarial-reviewer agent. The only file the agent may write is
// its report, and the only shell command it may run is the publishing script. Exit code 2 blocks the
// call.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { REVIEW_REPORT, isExactCommand, targetPath } from '../shared/agent-request.mjs';

export const AGENT = 'product-adversarial-reviewer';
export const COMMAND = 'node .claude/scripts/product-review/publish-review.mjs';

// Returns why the call is blocked, or null when it is allowed.
export function blockReason(event, root) {
  // Calls made by other agents follow their own rules.
  if (event.agent_type && event.agent_type !== AGENT) return null;
  if (event.tool_name === 'Bash') {
    return isExactCommand(event.tool_input, COMMAND) ? null : `the only shell command allowed is "${COMMAND}".`;
  }
  if (event.tool_name === 'Write') {
    return targetPath(event.tool_input, root) === REVIEW_REPORT
      ? null
      : `the only file this agent may write is ${REVIEW_REPORT}.`;
  }
  return `unexpected tool ${event.tool_name}.`;
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
