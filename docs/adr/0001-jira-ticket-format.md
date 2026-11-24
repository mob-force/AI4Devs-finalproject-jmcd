# ADR 0001: Jira ticket format and where its guidance lives

- **Status:** Proposed
- **Date:** 2026-11-24
- **Ticket:** KYP-4

## Context

KYP tickets are written and consumed by both people and AI assistants. Without a shared structure, tickets vary in quality and assistants need extra conversation to understand, estimate and verify the work. The format also has to be available to any AI tool working on the repo, not only to one vendor's, and it must not bloat the context that every session loads.

## Decision

1. Every Jira description (Epic, Story, Task, Bug) uses three sections: **Context (Why)**, **Acceptance Criteria / Definition of Done (What)** and **Scope / Details (How)**. The level of detail is adapted per issue type.
2. The guidance lives in the repository at [`docs/jira-ticket-guidelines.md`](../jira-ticket-guidelines.md).
3. `AGENTS.md` only holds a plain-path pointer to that document. Pointers in `AGENTS.md` are not imports: the referenced file is loaded only when the task needs it, and nothing is loaded at agent start beyond `AGENTS.md` itself.
4. Decisions like this one are recorded as ADRs in `docs/adr/`, numbered `NNNN-<slug>.md`.

## Consequences

- Positive: one versioned source of truth that works with any AI tool and can be reviewed in PRs.
- Positive: the always-loaded context stays small, since the full guide is read on demand.
- Negative: Jira and the repo can drift apart, so the repo document is the reference and Jira descriptions follow it.
- Negative: an assistant must follow the pointer to find the guidance. The pointer therefore has to say clearly when to read the document.

## Alternatives considered

- **Inline in `AGENTS.md`:** loaded on every task, even when no ticket is involved, and `AGENTS.md` is meant to stay brief.
- **`.claude/skills/`:** loads on demand, but only Claude Code uses it.
- **`.github/ISSUE_TEMPLATE/`:** applies to GitHub issues, not Jira.
- **Only in the Jira ticket (KYP-4):** not versioned, not reviewable and not visible to assistants working in the repo.
