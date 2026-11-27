# ADR 0006: ADRs cover only architectural and project process decisions

- **Status:** Adopted
- **Date:** 2026-11-27
- **Ticket:** KYP-15

## Context

ADR 0002 asked for an ADR for every important decision of any kind. The first product documentation task (KYP-8) therefore recorded its product decisions twice: in `docs/product/idea.md` and in six ADRs, then numbered 0006 to 0011. The two copies had to be read together and kept consistent, and the product documentation depended on links to be understood.

## Decision

1. ADRs record important **architectural** and **project process** decisions only. `docs/adr/README.md` defines both categories.
2. **Product** decisions are recorded in the product documentation (`docs/product/`), with their reasons and the alternatives rejected, and get no ADR.
3. The rest of ADR 0002 stays: a decision is important if it is costly to reverse, picks between real alternatives, or changes how people or assistants work; when in doubt about an architectural or process decision, an ADR is written; the ADR is created without being asked and on the same branch as the change; the rule is in `AGENTS.md` and the format in `docs/adr/README.md`.
4. The six product ADRs are deleted after their content moves to `docs/product/idea.md`. This is a one-time exception to superseding past decisions. Their numbers are used again, so that the sequence has no gaps; this ADR is the new 0006.
5. The Product Owner agent can no longer write to `docs/adr/`.

## Consequences

- Positive: each product decision has one home, and the product documentation can be read on its own.
- Positive: the ADR index holds only what constrains how the product is built and how the project works.
- Negative: a decision can fall between categories, so someone has to judge where it goes.
- Negative: product documents grow, and a changed product decision has no superseded record in the document; its history is in Git.
- Negative: prompt logs and earlier pull requests use 0006 to 0011 for the deleted ADRs, so in them a number can mean a different decision from the one it identifies now.
- Negative: if a documentation task calls for an architectural or process decision, the Product Owner agent can only report it.

## Alternatives considered

- **Keep ADRs for every decision:** keeps the duplication that prompted this change.
- **Product decisions only in ADRs, linked from the documents:** the product documentation could not be read on its own.
- **Mark the product ADRs as superseded and keep them:** the duplicated text would stay in the repository and could still be read as current.
- **Leave their numbers unused and number this ADR 0012:** avoids reusing numbers, but leaves a gap in the sequence.
- **A separate decision log for product decisions:** a second place to keep consistent with the documents.
