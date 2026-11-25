# ADR 0004: Model and form of the Product Owner agent

- **Status:** Adopted
- **Date:** 2026-11-26
- **Ticket:** KYP-13

## Context

The product documentation needs an owner that delivers every Jira task the same way: move it to In Progress, branch, write, open a draft pull request and have it challenged by the Product Adversarial Reviewer. The workflow acts on Jira and GitHub, must stop on anything unexpected, and must not merge, mark pull requests ready, close tasks or write code. The reviewer must run on a different model (ADR 0003), and since KYP-12 it posts its own findings on the pull request.

## Decision

1. The Product Owner is an agent in `.claude/agents/product-owner.md` that runs as the **main session** (`claude --agent product-owner`) and starts the reviewer as a subagent.
2. It runs on **Claude Sonnet 5.5** (`claude-sonnet-5-5`), at `high` effort.
3. The git and GitHub steps are a script, `.claude/scripts/product-owner/workflow.mjs`, which checks the preconditions of each step and refuses when they are not met. It takes its requests from a file (ADR 0005).
4. A `PreToolUse` hook limits the agent to that script, to product documentation files, to starting the reviewer and to moving a task to In Progress.
5. Jira is used through the claude.ai Atlassian MCP connector, and GitHub through `gh`.
6. The Product Owner does not post findings. It starts the reviewer, then verifies that the review is on the latest commit.

## Consequences

- Positive: the same steps and stop conditions on every task, covered by tests instead of relying on the model.
- Positive: the limits of the ticket are enforced, including that the agent cannot edit its own definition or hook.
- Positive: as the main session it can ask the person about product decisions.
- Negative: a script and a hook have to be maintained, and any new git step needs a code change.
- Negative: it depends on tool names of one person's Jira connector, so another setup has to change the agent definition.
- Negative: it only handles new tasks. Resuming one, or applying review findings, is done by hand.
- Negative: Claude Code skips the hook in a folder that is not trusted, and as a subagent the limit on which agents it starts relies on the hook alone.

## Alternatives considered

- **Run it as a subagent of a normal session:** it could not ask questions, and Claude Code would ignore the limit on which subagents it may start.
- **The main session orchestrates both agents:** the workflow would live in prompts typed by the person, with nothing to enforce it.
- **Unrestricted `Bash` with the workflow only described:** simpler, but nothing would stop a merge, a force push or a skipped check.
- **A Claude Code skill:** reusable steps, but no model pinned and no tool limits of its own.
- **The GitHub MCP server:** the configured one fails to connect, while `gh` is signed in and already used by the reviewer.
- **Claude Opus 5.5 for the Product Owner:** the reviewer would then need another model, and the stronger model is more useful on the challenging side.
