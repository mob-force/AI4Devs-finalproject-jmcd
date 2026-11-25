#!/usr/bin/env node
// PreToolUse hook of the product-adversarial-reviewer agent. The only shell command the agent may
// run is the publishing script, fed through a quoted heredoc so that nothing in the report is
// expanded or executed. Exit code 2 blocks the command.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const FIRST_LINE = "node .claude/scripts/product-review/publish-review.mjs <<'KYP_REVIEW'";
export const LAST_LINE = 'KYP_REVIEW';

export function isAllowed(toolInput) {
  const command = toolInput?.command;
  if (typeof command !== 'string' || toolInput.dangerouslyDisableSandbox) return false;
  if (command.includes('\0') || command.includes('\r')) return false;
  const lines = command.replace(/\n+$/, '').split('\n');
  return (
    lines.length >= 3 &&
    lines[0] === FIRST_LINE &&
    // The first terminator line ends the heredoc, so it must also be the last line.
    lines.indexOf(LAST_LINE) === lines.length - 1
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let allowed = false;
  try {
    allowed = isAllowed(JSON.parse(readFileSync(0, 'utf8')).tool_input);
  } catch {
    allowed = false;
  }
  if (!allowed) {
    console.error(
      `Blocked: this agent may only run the publishing command, with the report between "${FIRST_LINE}" and "${LAST_LINE}".`,
    );
    process.exit(2);
  }
}
