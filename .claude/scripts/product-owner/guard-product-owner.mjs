#!/usr/bin/env node
// PreToolUse hook of the product-owner agent. It limits the shell to the workflow script, file
// changes to product documentation, subagents to the adversarial reviewer and Jira transitions to
// "In Progress". Exit code 2 blocks the call.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { PO_REQUEST, isExactCommand, targetPath } from '../shared/agent-request.mjs';
import { PRODUCT_PATHS, isProductPath } from './paths.mjs';

export const AGENT = 'product-owner';
export const REVIEWER = 'product-adversarial-reviewer';
export const COMMAND = 'node .claude/scripts/product-owner/workflow.mjs';
export const TRANSITION_TOOL = 'mcp__claude_ai_Atlassian_MCP__transitionJiraIssue';
const TRANSITION_KEYS = ['cloudId', 'issueIdOrKey', 'transitionName'];

// Returns why the call is blocked, or null when it is allowed.
export function blockReason(event, root) {
  // Calls made by other agents, such as the reviewer, follow their own rules.
  if (event.agent_type && event.agent_type !== AGENT) return null;
  const input = event.tool_input ?? {};

  switch (event.tool_name) {
    case 'Bash':
      return isExactCommand(input, COMMAND) ? null : `the only shell command allowed is "${COMMAND}".`;
    case 'Write':
    case 'Edit': {
      const path = targetPath(input, root);
      return path === PO_REQUEST || isProductPath(path)
        ? null
        : `this agent may only change ${PRODUCT_PATHS} and its request file ${PO_REQUEST}.`;
    }
    case 'Agent':
      return input.subagent_type === REVIEWER && !input.model && !input.isolation
        ? null
        : `the only subagent allowed is ${REVIEWER}, without a model or isolation override.`;
    case TRANSITION_TOOL:
      return input.transitionName === 'In Progress' &&
        /^KYP-\d+$/.test(input.issueIdOrKey) &&
        Object.keys(input).every((key) => TRANSITION_KEYS.includes(key))
        ? null
        : 'the only Jira transition allowed is moving a KYP task to "In Progress", by transitionName.';
    default:
      return `unexpected tool ${event.tool_name}.`;
  }
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
