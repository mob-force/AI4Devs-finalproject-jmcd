# Architecture Decision Records

ADRs record **why** important architectural and project process decisions were taken. The rule that requires them, and the criterion for what counts as important, is in `AGENTS.md`.

## What gets an ADR

| Category | What it decides | Examples |
|---|---|---|
| Architectural | How the product is built | The UI framework, a pattern to use, a data source |
| Project process | How the project works | Adopting a tool such as OpenSpec, the Jira ticket format, an agent's model, a working rule |

The examples illustrate the categories. The [index](#index) lists the decisions taken.

**Product decisions get no ADR.** What the product does, for whom, its scope and how its success is measured belong in the product documentation (`docs/product/`), recorded as `AGENTS.md` describes, so that the documentation can be read on its own. When a product decision leads to an architectural one, record the product decision there and the architectural one in an ADR.

## Writing an ADR

1. Check that the decision is architectural or about the project process.
2. Create `NNNN-<slug>.md` in this folder, using the number after the highest one in the [index](#index) (four digits).
3. Fill in the template below. Spend most of the words on the reasons: the context that forced the decision and why the alternatives were rejected.
4. Add a row to the [index](#index) in the same change.
5. Commit it on the same branch as the change it explains.

One ADR covers one decision. To change a past decision, write a new ADR and set the old one's status to `Superseded by NNNN` instead of rewriting it.

There has been one exception: six ADRs that recorded product decisions were deleted after their content moved to the product documentation (ADR 0006). They were numbered 0006 to 0011, and those numbers are used again to keep the sequence, so in prompt logs and pull requests up to KYP-15 they can refer to the deleted ADRs.

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
| [0002](0002-record-decisions-as-adrs.md) | Record important decisions as ADRs | Superseded by 0006 |
| [0003](0003-product-reviewer-model.md) | Model and form of the Product Adversarial Reviewer | Proposed |
| [0004](0004-product-owner-agent.md) | Model and form of the Product Owner agent | Adopted |
| [0005](0005-agent-requests-through-files.md) | Agents pass requests to their scripts through a file | Adopted |
| [0006](0006-adrs-for-architecture-and-process.md) | ADRs cover only architectural and project process decisions | Adopted |
| [0007](0007-apex-layering.md) | Layer Apex with the Apex Enterprise Patterns, without the fflib library | Proposed |
| [0008](0008-trigger-framework.md) | A minimal in-house trigger framework | Proposed |
