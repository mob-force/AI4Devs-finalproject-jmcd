# Technical design documents

A technical design document (TDD) describes how a part of KYP is built, in enough detail to review it and to hand it to development. A single important decision is an ADR instead (`docs/adr/README.md`). A TDD links to the ADRs it relies on rather than repeating their reasons.

## Writing a TDD

1. Create `NNNN-<slug>.md` in this folder, using the number after the highest one in the [index](#index) (four digits, from 0001). TDDs are numbered independently of ADRs.
2. Fill in the template below.
3. Add a row to the [index](#index) in the same change.
4. Commit it on the branch of its ticket.

The [AAF author agent](../../agents/aaf-author.md) can draft it.

## Template

```markdown
# TDD NNNN: <title>

- **Status:** Proposed
- **Date:** YYYY-MM-DD
- **Ticket:** KYP-<n>

## Context

The problem, the requirements it serves and the constraints, with the principles that apply cited by ID (`P-xx`).

## Options

- **<Option>:** what it is, its trade-offs, and why it was chosen or rejected.

## Decision

The chosen option and its design: components and responsibilities, data (object and field names), method signatures and how the parts interact. Diagrams in Mermaid. Links to the ADRs it relies on.

## Consequences

- Positive: ...
- Negative: ...

## Assumptions and open questions

## Left to development

What is deliberately not decided here.
```

## Status

The statuses are those of ADRs (`docs/adr/README.md`). A TDD stays `Proposed` while it is drafted and reviewed (`docs/agents/aaf-forum.md`). The person sets it to `Adopted`, here and in the index, and the adopted TDD is the handoff to development. To change an adopted TDD, write a new one and set the old one to `Superseded by NNNN`.

## Index

| TDD | Title | Status |
|---|---|---|
