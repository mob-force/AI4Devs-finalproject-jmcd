# ADR 0009: Model and form of the AAF author agent

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-21

## Context

The Architecture Advisory Forum (AAF) needs one author that drafts ADRs and technical design documents (TDDs), starting with those of Epic KYP-16, for a panel of reviewer agents and a chair. The adopted documents are the handoff to development, so adopting one has to remain the person's act. As with the product documentation (ADR 0003), the reviewers should not run on the author's model, or they would tend to accept the same assumptions. Drafting depends on choices that only the person can take, and the author reads tickets and web pages, which are not trusted input. Unlike a product documentation task (ADR 0004), a design goes through drafting, review and revision on the same branch before it is delivered.

## Decision

1. The author is an agent in `.claude/agents/aaf-author.md`, meant to run as the **main session** (`claude --agent aaf-author`). It can also run as a subagent.
2. It runs on **Claude Sonnet 5.5** (`claude-sonnet-5-5`), pinned by full model ID, at `high` effort. The reviewers and the chair run on another model, recorded in their own ADRs.
3. It gets read, web and file-editing tools, questions to the person, and read-only Jira tools. It gets **no shell** and starts no subagents.
4. A `PreToolUse` hook lets it write only ADRs, TDDs, their index rows and prompt logs. It can create and revise `Proposed` documents only, and cannot give any document or index row another status.
5. Branches, commits, pull requests, the forum review and adopting a document are done by the person.
6. TDDs are `docs/architecture/tdd/NNNN-<slug>.md`, with their own numbering and index and the statuses of ADRs.

## Consequences

- Positive: the model, the tools and the files it may change are enforced by the agent definition and its hook, not only requested in its prompt.
- Positive: it cannot adopt its own design, rewrite an adopted one, or change the principles, the review records or its own definition.
- Positive: with no shell, text from a ticket or web page cannot make it run commands or publish anything on GitHub.
- Positive: the stronger model is on the challenging side, as in the product agents.
- Negative: the person does every Git and GitHub step, and the agent cannot check that it is on the right branch.
- Negative: the level of detail and the use of principle IDs are only instructions, so the reviewers and the person have to catch breaches.
- Negative: the hook cannot tell which task a `Proposed` document or a prompt log belongs to.
- Negative: author and reviewers come from the same provider and may share blind spots.
- Negative: Claude Code skips the hook in a folder that is not trusted. There only the permission settings limit the file tools.
- Negative: it depends on tool names of one person's Jira connector, as the Product Owner agent does.
- Negative: the pinned ID does not follow new releases, so changing it means a new ADR and another sample run.
- Negative: a model chosen when starting it overrides the pinned one. The agent is told to stop only if that is the reviewers' model.

## Alternatives considered

- **Claude Opus 5.5 for the author:** it may draft stronger designs, but the reviewers and the chair would need another model, and the stronger model is more useful for challenging a design than for filling a template. It also costs more per token (ADR 0003).
- **A subagent only:** it could not ask the person about the choices that shape a design.
- **A command or skill in the normal session:** reusable instructions, but no pinned model and no tool limits of its own, and that session may well be on the reviewers' model.
- **A workflow script that also branches, commits and opens the pull request,** as the Product Owner has: the same steps every time, but more code for a flow that revises a document several times and whose end the person decides. It can be added if doing these steps by hand proves a problem.
- **Unrestricted shell and editing:** nothing would stop it from adopting its own design, changing code or publishing.
- **Limiting only the paths it writes:** simpler, but it could rewrite an adopted decision or mark its own draft adopted.
