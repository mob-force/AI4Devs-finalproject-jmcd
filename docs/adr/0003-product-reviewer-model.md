# ADR 0003: Model and form of the Product Adversarial Reviewer

- **Status:** Proposed
- **Date:** 2026-11-25
- **Ticket:** KYP-12

## Context

Product documentation needs a counterpart that challenges it. A reviewer running on the same model as the author tends to accept the same assumptions, so the reviewer has to run on a different LLM model from the Product Owner agent (KYP-13). A different model is enough: it does not need to come from a different provider. The Product Owner agent is not built yet and is expected to run on Claude Sonnet 5.5.

The findings have to be posted as comments on the open pull request of the branch that contains the changes, by the reviewer itself.

## Decision

1. The reviewer is a Claude Code subagent, `.claude/agents/product-adversarial-reviewer.md`.
2. It runs on **Claude Opus 5.5** (`claude-opus-5-5`), pinned by full model ID, at `high` effort.
3. The Product Owner agent must run on a different model, and whoever calls the reviewer must not override its model.
4. It gets read and web tools (`Read`, `Grep`, `Glob`, `WebSearch`, `WebFetch`) and `Bash`, but no editing tools.
5. A `PreToolUse` hook in the agent definition blocks every shell command except `.claude/scripts/product-review/publish-review.mjs`, which receives the report through a quoted heredoc. *(How the report reaches the script, and the file tool this needs, were changed by ADR 0005.)*
6. The script, not the model, decides what is posted: it rejects findings without proof, uses only the open pull request of the checked-out branch, and only ever posts comments and a review of type *comment*.
7. Every finding must be visible to whoever reviews the pull request: on its line in the diff, otherwise on its file in the diff, otherwise in full in the summary comment. Findings about a file that differs from the pull request go in the summary with a warning.

## Consequences

- Positive: a stronger model than the author's checks the work, with no extra provider, credentials or integration, and the documents stay with the provider already in use.
- Positive: the model and the limit to one command are enforced by the agent definition, not only requested in its prompt.
- Positive: the findings reach the pull request whoever calls the reviewer.
- Negative: the reviewer now acts outside the session. Text taken from the documents or the web can end up in a comment, posted under the signed-in GitHub account.
- Negative: Claude Code skips agent hooks in a folder that is not trusted. There only the permission settings limit `Bash`, so broad `Bash` allow rules must not be combined with this agent.
- Negative: publishing depends on `gh`, Node and script code that has to be maintained.
- Negative: both models come from the same provider and may share blind spots.
- Negative: Claude Opus 5.5 costs twice as much per token as Claude Sonnet 5.5 ($4 / $20 against $2 / $10 per million input / output tokens at API rates when this was written).
- Negative: the pinned ID does not follow new releases, so changing it means a new ADR and running the sample check again.
- Negative: a per-call model parameter, or the `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` setting, overrides the pinned model. The report states the model used so this can be spotted.

## Alternatives considered

- **Another provider** (OpenAI through the Codex CLI, GitHub Copilot CLI, Ollama local or cloud): more independent, but not required. It adds an integration and credentials, and either sends the documents to a further service or relies on a weaker local model.
- **Claude Fable 5.2:** more capable, at twice the token price of Claude Opus 5.5, which is not justified for reviewing short product documents.
- **Claude Haiku 5.5:** much cheaper, but challenging a solution and proving the case needs stronger reasoning.
- **The `opus` alias:** follows new releases by itself, so the review behaviour could change without anyone noticing.
- **The caller publishes the report:** keeps the reviewer read-only, but every caller has to repeat the publishing steps and a review run on its own leaves no comments.
- **Unrestricted `Bash` with instructions in the prompt:** simpler, but a reviewer that reads untrusted text could then run any command.
- **Refusing to publish when a file differs from the pull request:** keeps line numbers exact, but leaves the findings invisible to reviewers.
- **Putting a finding on the nearest changed line:** keeps it in the diff, but points reviewers at text it is not about.
- **Committing a findings file so that every finding is in the diff:** the reviewer would have to change the branch it reviews.
- **A GitHub MCP server:** the configured one fails to connect, and the line placement and checks would be left to the model.
