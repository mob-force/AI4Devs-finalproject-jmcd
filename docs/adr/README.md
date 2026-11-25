# Architecture Decision Records

ADRs record **why** important decisions were taken. Despite the name, they cover any kind of decision: setup, technology, product, process or other. The rule that requires them, and the criterion for what counts as important, is in `AGENTS.md`.

## Writing an ADR

1. Create `NNNN-<slug>.md` in this folder, using the next free number (four digits).
2. Fill in the template below. Spend most of the words on the reasons: the context that forced the decision and why the alternatives were rejected.
3. Add a row to the [index](#index) in the same change.
4. Commit it on the same branch as the change it explains.

One ADR covers one decision. To change a past decision, write a new ADR and set the old one's status to `Superseded by NNNN` instead of rewriting it.

## Template

```markdown
# ADR NNNN: <title>

- **Status:** Proposed
- **Date:** YYYY-MM-DD
- **Ticket:** KYP-<n>

## Context

The problem, constraints and forces that make a decision necessary.

## Decision

What was decided.

## Consequences

- Positive: ...
- Negative: ...

## Alternatives considered

- **<Alternative>:** why it was rejected.
```

## Status

| Status | Meaning |
|---|---|
| Proposed | Written, not yet confirmed |
| Adopted | Confirmed and in force |
| Superseded by NNNN | Replaced by a later ADR |

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-jira-ticket-format.md) | Jira ticket format and where its guidance lives | Adopted |
| [0002](0002-record-decisions-as-adrs.md) | Record important decisions as ADRs | Adopted |
| [0003](0003-product-reviewer-model.md) | Model and form of the Product Adversarial Reviewer | Proposed |
| [0004](0004-product-owner-agent.md) | Model and form of the Product Owner agent | Proposed |
