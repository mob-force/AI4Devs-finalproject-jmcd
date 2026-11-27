# ADR 0010: Model and form of the AAF reviewer panel

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-22

## Context

The Architecture Advisory Forum (AAF) reviews every ADR and technical design document before developers build on it. One reviewer asked to cover data, contracts, platform limits, security and simplicity at once tends to be long and uneven, and advisers whose areas are not fixed repeat each other. Their reviews are combined afterwards, so they have to share one form. A reviewer running on the author's model tends to accept the same assumptions, as ADR 0003 reasons for the product documentation.

## Decision

1. The panel is five Claude Code subagents in `.claude/agents/`, one per area: `aaf-data`, `aaf-api`, `aaf-platform`, `aaf-security` and `aaf-skeptic`. Each reviews one document without seeing the others' reviews.
2. All five run on **Claude Opus 5.5** (`claude-opus-5-5`), pinned by full model ID, at `high` effort. The author runs on a different model (ADR 0009), and whoever calls a reviewer must not override its model.
3. Their only tools are `Read`, `Grep` and `Glob`. A reviewer returns its review as its answer and writes no file.
4. The rules they share, the borders between their areas and the output form are written once, in `docs/architecture/review-contract.md`. Each definition holds only its own area and reads that file first.
5. A review has at most 5 findings and stays at design level.

## Consequences

- Positive: each area gets its own attention, and the border rules limit repeated findings.
- Positive: the tool list, not only the instructions, keeps a reviewer from changing anything or starting other agents.
- Positive: a rule or the output form changes in one place.
- Positive: a stronger model than the author's checks the work, with no extra provider or integration.
- Negative: every review of a document costs five runs on Claude Opus 5.5, which costs twice as much per token as Claude Sonnet 5.5 ($4 / $20 against $2 / $10 per million input / output tokens at base API prices, checked on 2026-11-28 in the [models overview](https://platform.claude.com/docs/en/models/overview)).
- Negative: areas, form and limit of findings rest on instructions. Nothing checks an answer.
- Negative: the contract is in a reviewer's context only once the reviewer reads it.
- Negative: without web access, platform facts come from the model's knowledge and the repository, and may be out of date.
- Negative: author and reviewers come from the same provider and may share blind spots.
- Negative: a per-call model parameter or the `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` setting overrides the pinned model, and the output form has no line that would show it.
- Negative: packaging concerns (namespacing, upgrade safety, deprecating global members, testability) are not reviewed.
- Negative: the pinned ID does not follow new releases, so changing it means a new ADR and running the sample check again.

## Alternatives considered

- **One reviewer for all areas:** one run instead of five, but the areas compete for attention and for a short list of findings.
- **One definition that is given its area by the caller:** a single file, but every caller has to describe the areas, and none can be tuned or restricted on its own.
- **A sixth, Packaging & Delivery Advisor:** left out until KYP is distributed as a package.
- **Claude Sonnet 5.5:** half the token price, but it is the author's model.
- **Claude Fable 5.2:** meant for more demanding reasoning, at twice the token price of Claude Opus 5.5, which is not justified for reviewing short design documents.
- **Claude Haiku 5.5:** much cheaper, but meant for high-volume, simpler work than judging a design.
- **Different models for different reviewers:** could save on some areas, but nothing yet shows which area needs less, and there would be more to check.
- **The `opus` alias:** follows new releases by itself, so review behaviour could change without anyone noticing.
- **The contract copied into each definition:** always in context, but five copies drift apart.
- **The contract as a skill preloaded with the `skills` field:** in context from the start, but it would move a document that people and the chair also read out of the architecture documentation.
- **Web tools to check platform facts:** fresher facts, but slower and longer reviews and untrusted text in the reviewers' context.
- **Reviewers that write their own review files:** needs editing tools, and the record of a review belongs to the chair.
