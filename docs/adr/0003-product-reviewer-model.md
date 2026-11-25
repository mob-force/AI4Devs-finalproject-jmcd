# ADR 0003: Model and form of the Product Adversarial Reviewer

- **Status:** Proposed
- **Date:** 2026-11-25
- **Ticket:** KYP-12

## Context

Product documentation needs a counterpart that challenges it. A reviewer running on the same model as the author tends to accept the same assumptions, so the reviewer has to run on a different LLM model from the Product Owner agent (KYP-13). A different model is enough: it does not need to come from a different provider. The Product Owner agent is not built yet and is expected to run on Claude Sonnet 5.5.

## Decision

1. The reviewer is a Claude Code subagent, `.claude/agents/product-adversarial-reviewer.md`.
2. It runs on **Claude Opus 5.5** (`claude-opus-5-5`), pinned by full model ID, at `high` effort.
3. The Product Owner agent must run on a different model, and whoever calls the reviewer must not override its model.
4. It only gets read and web tools (`Read`, `Grep`, `Glob`, `WebSearch`, `WebFetch`), so it cannot edit the documents it reviews.

## Consequences

- Positive: a stronger model than the author's checks the work, with no extra provider, credentials or integration, and the documents stay with the provider already in use.
- Positive: the model and the read-only limit are enforced by the agent definition, not only requested in its prompt.
- Negative: both models come from the same provider and may share blind spots.
- Negative: Claude Opus 5.5 costs twice as much per token as Claude Sonnet 5.5 ($4 / $20 against $2 / $10 per million input / output tokens at API rates when this was written).
- Negative: the pinned ID does not follow new releases, so changing it means a new ADR and running the sample check again.
- Negative: a per-call model parameter, or the `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` setting, overrides the pinned model. The report states the model used so this can be spotted.

## Alternatives considered

- **Another provider** (OpenAI through the Codex CLI, GitHub Copilot CLI, Ollama local or cloud): more independent, but not required. It adds an integration and credentials, and either sends the documents to a further service or relies on a weaker local model.
- **Claude Fable 5.2:** more capable, at twice the token price of Claude Opus 5.5, which is not justified for reviewing short product documents.
- **Claude Haiku 5.5:** much cheaper, but challenging a solution and proving the case needs stronger reasoning.
- **The `opus` alias:** follows new releases by itself, so the review behaviour could change without anyone noticing.
