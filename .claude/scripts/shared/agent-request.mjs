// How an agent hands content to its script: it writes one file and runs one fixed command. Content
// never goes through the shell, where Claude Code rejects long or complex commands.
import { readFileSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

export const REVIEW_REPORT = '.agent-tmp/review-report.md';
export const PO_REQUEST = '.agent-tmp/po-request.json';

// True when the input runs exactly `command`.
export function isExactCommand(toolInput, command) {
  return (
    typeof toolInput?.command === 'string' &&
    toolInput.command.replace(/\n+$/, '') === command &&
    !toolInput.dangerouslyDisableSandbox
  );
}

// The path of a file tool call, relative to the repository root.
export function targetPath(toolInput, root) {
  return typeof toolInput?.file_path === 'string' ? relative(root, resolve(root, toolInput.file_path)) : null;
}

// Reads the file and removes it, so that a request is used once and the next one can be written.
export function takeRequest(root, path) {
  const file = join(root, path);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    throw new Error(`there is no request: write it to ${path} first`);
  }
  rmSync(file);
  return text;
}
