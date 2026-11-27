# ADR 0007: Layer Apex with the Apex Enterprise Patterns, without the fflib library

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-20

## Context

The technical documentation of KYP (KYP-16) and the code that follows it will be written and reviewed by agents and people against shared principles. Without agreed layers, each design would place queries, writes and business rules differently, and every review would argue the point again. Moving logic between layers after code exists is costly.

The MVP only shows information (decision D5 in `docs/product/idea.md`), so it changes nothing in packages or subscriber orgs. Whatever it writes goes into its own objects, and how much it writes is not yet designed (KYP-17).

The Apex Enterprise Patterns separate Service, Domain, Selector and Unit of Work. Salesforce teaches them in Trailhead modules, and the open source library [fflib-apex-common](https://github.com/apex-enterprise-patterns/fflib-apex-common) (BSD-3-Clause, last pushed to in November 2026 when checked on 2026-11-28) provides base classes for them: 21 classes and 10 test classes in its repository on that date.

## Decision

1. Apex uses the Service, Domain and Selector layers and the unit of work idea, plus a client class for each external API. The rules are principles P-01 to P-07 in `docs/architecture/principles/patterns.md`, and the class names are in `conventions.md`.
2. The fflib library is **not** installed. Layers are plain classes, with no application factory, base classes or generic interfaces.
3. The unit of work is a rule, not a class: a Service collects its changes and commits them once. A shared unit of work class is written only when a second Service would repeat the same commit logic.
4. Installing fflib later needs a new ADR, for instance if committing related records by hand becomes repetitive or tests need the replaceable factories it offers.

## Consequences

- Positive: reviews can point to one rule for where a query, a write or a rule belongs.
- Positive: no third-party code to install, update, cover with tests or include in a security review.
- Positive: the names follow a widely taught pattern, so moving to the library later keeps the structure.
- Negative: ordering parent and child writes and rolling them back is hand-written, which the library's unit of work already does.
- Negative: no ready-made base classes or factories, so replacing a dependency in a test has to be designed case by case.
- Negative: a simple read passes through a Service that does little more than call a Selector.
- Negative: someone who knows fflib may expect base classes that are not there.

## Alternatives considered

- **The same layers with fflib-apex-common:** gives a tested unit of work and common base classes. Rejected for now: it adds third-party code and its base classes to learn for an MVP of at most 5 user stories that mostly reads data, and most of it would be unused at the start.
- **Selectors and Services only, without a Domain layer:** fewer classes, but per-object rules would end up spread over Services and trigger handlers. A Domain class is still only written when an object has rules (P-17).
- **No layering, logic in controllers and triggers:** quickest to start, but queries and rules get duplicated between entry points and cannot be reviewed against a shared rule.
- **Decide the layers in each technical design:** no commitment now, but designs written in parallel could not be compared and reviewers would have no principle to cite.
