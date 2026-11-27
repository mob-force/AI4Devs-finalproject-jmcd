# ADR 0011: The architecture review runs as a command with a separate chair

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-23

## Context

The Architecture Advisory Forum reviews an ADR or technical design document with five reviewers. Their findings overlap and can contradict each other, so someone has to merge them, settle the conflicts, give one verdict and record it. That chair should judge on a model other than the author's, without the conversation that produced the document, and without being able to change it.

Something also has to start the reviewers. KYP-23 assumed that a Claude Code subagent cannot start other subagents. This is no longer true: since version 2.1.219 a subagent can by default start its own, up to three layers deep, and `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` turns this off ([subagents](https://code.claude.com/docs/en/sub-agents), [changelog](https://code.claude.com/docs/en/changelog), checked on 2026-11-28). A command with a separate chair is therefore a choice, not a constraint.

## Decision

1. `/forum-review <path>` is a project skill, `.claude/skills/forum-review/SKILL.md`, that runs in the main session. Only a person can start it (`disable-model-invocation: true`).
2. The main session only finds the document, starts the five reviewers in parallel, passes their answers unchanged to the chair and reports the result.
3. The chair is a subagent, `.claude/agents/aaf-chair.md`, on **Claude Opus 5.5** (`claude-opus-5-5`), pinned by full model ID, at `high` effort. The author runs on another model (ADR 0009).
4. The chair gets `Read`, `Grep`, `Glob` and `Write`. A `PreToolUse` hook limits `Write` to the review record of an existing document.
5. The chair rules on the reviewers' findings and adds none. The verdict follows from the tags of the findings it upholds.

## Consequences

- Positive: the model and the limit to review records belong to the chair's definition, whatever the main session runs on.
- Positive: the chair starts from the document and the five answers, not from the conversation that wrote the document.
- Positive: it does not depend on the nesting depth setting, and the person sees each reviewer run.
- Positive: the verdict can be checked against the findings table of the record.
- Negative: nothing enforces the fan-out, the wait or the unchanged answers. The main session follows instructions, on a model that is not pinned.
- Negative: the five answers pass through the main session and take up its context.
- Negative: each review starts six subagents. The chair's model costs twice as much per token as the author's ($4 / $20 against $2 / $10 per million input / output tokens at [API rates](https://platform.claude.com/docs/en/about-claude/pricing) on 2026-11-28).
- Negative: the hook lets the chair write any review record of an existing document, not only the current one, and does not check what the record says.
- Negative: Claude Code skips the hook when the folder itself is not trusted. There only the permission settings limit `Write`, so the chair must not be combined with broad edit permissions.
- Negative: the pinned ID does not follow new releases, so changing it means a new ADR.
- Negative: a per-call model parameter, or the `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` setting, overrides the pinned model. The record states the model used so this can be spotted.
- Negative: the author, reviewers and chair use models from one provider and may share blind spots.

## Alternatives considered

- **The command prompt acts as chair:** one agent fewer and no relaying, but the judging would use the session's model, which can be the author's, with the drafting conversation in context. Limiting its writes would mean limiting the whole session, where a skill's hooks stay until the conversation is left.
- **A chair subagent that starts the reviewers:** possible by default, and keeps the answers out of the main context. In a subagent definition Claude Code ignores a list of allowed agent types, so the chair could start any agent unless the hook also checked that. It stops working where nesting is turned off, and in an interactive session only the chair's report comes back.
- **A skill with `context: fork` that runs as the chair:** the same nested fan-out, with the same limits.
- **The chair as the main session** (`claude --agent aaf-chair`, as for the Product Owner): Claude Code would enforce which agents it starts, but every review would need a new session instead of a command in the current one.
- **A saved dynamic workflow:** the fan-out and wait would be code, but workflows can be turned off, need enabling on some plans, and add a script to maintain for six agent calls.
- **A file in `.claude/commands/`:** still works, but Claude Code has merged commands into skills and [recommends skills](https://code.claude.com/docs/en/skills) for new work.
- **A script that writes the record from a request file** (the pattern of ADR 0005): could check the content, but the chair would need a shell, and the record is a local file that is reviewed before it is committed.
- **Claude Sonnet 5.5 for the chair:** cheaper, but the author's model, so it would tend to accept the author's assumptions.
- **Claude Fable 5.2:** costs twice as much per token as Claude Opus 5.5 ($8 / $40), which is not justified for weighing at most 25 short findings.
- **Claude Haiku 5.5:** much cheaper, but settling conflicts between reviewers needs stronger reasoning.
- **The `opus` alias:** the chair's behaviour could change with a release or with the session's Opus version without anyone noticing.
