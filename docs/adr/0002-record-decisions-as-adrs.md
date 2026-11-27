# ADR 0002: Record important decisions as ADRs

- **Status:** Superseded by 0006
- **Date:** 2026-11-25
- **Ticket:** KYP-14

## Context

The repository shows what was built, but not why. Work is done by people and AI assistants across separate sessions, and the reasoning behind a choice is lost when the session ends. ADR 0001 established where ADRs live, but nothing required anyone to write one: `AGENTS.md` only pointed to `docs/adr/` for reading past decisions.

## Decision

1. `AGENTS.md` requires an ADR for every important decision of any kind, created without being asked and on the same branch as the change.
2. A decision is important if it is costly to reverse, picks between real alternatives, or changes how people or assistants work. Routine changes that follow an existing convention or ADR need none. When in doubt, an ADR is written.
3. The rule and its criterion stay in `AGENTS.md`. The format, numbering and index guidance live in `docs/adr/README.md`, read only when writing an ADR.

## Consequences

- Positive: the reasons behind decisions are versioned, reviewable in pull requests and available to later sessions.
- Positive: the criterion is always loaded, so an assistant can recognise an important decision without opening another file.
- Negative: the rule adds text to every session's context.
- Negative: "important" needs judgement, so some ADRs may be missing or unnecessary.
- Negative: nothing enforces the rule automatically, so reviewers have to check it.

## Alternatives considered

- **Keep ADRs optional:** relies on someone remembering, which is the gap this closes.
- **An ADR for every decision:** the important ones would be buried and writing them would slow routine work.
- **Whole rule in `docs/adr/README.md`:** assistants would not see it unless they already intended to write an ADR.
- **Reasons only in Jira, commits or the prompt log:** scattered, and not a curated record of what is in force.
- **Enforcement through a Git hook or CI:** a script cannot reliably tell whether a change involves an important decision.
