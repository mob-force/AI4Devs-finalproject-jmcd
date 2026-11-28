# ADR 0007: Layer Apex with the Apex Enterprise Patterns, without the fflib library

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-20

## Context

The technical documentation of KYP (KYP-16) and the code that follows it will be written and reviewed by agents and people against shared principles. Without agreed layers, each design would place queries, writes and business rules differently, and every review would argue the point again. Moving logic between layers after code exists is costly.

The project also requires singleton Services, Selectors and trigger handlers, a unit of work obtained with `newInstance()`, and unit tests that mock the other levels so that each tests only its own responsibility.

The MVP only shows information (decision D5 in `docs/product/idea.md`), so it changes nothing in packages or subscriber orgs. Whatever it writes goes into its own objects, and how much it writes is not yet designed (KYP-17).

The Apex Enterprise Patterns separate Service, Domain, Selector and Unit of Work. Salesforce teaches them in Trailhead modules, and the open source library [fflib-apex-common](https://github.com/apex-enterprise-patterns/fflib-apex-common) (BSD-3-Clause, last pushed to in November 2026 when checked on 2026-11-28) provides base classes for them: 21 classes and 10 test classes in its repository on that date.

## Decision

1. Apex uses the Service, Domain and Selector layers and a unit of work, plus a client class for each external API. The rules are principles P-01 to P-07, P-46, P-47, P-49 and P-50 in `docs/architecture/principles/patterns.md`, and the class names are in `conventions.md`.
2. The fflib library is **not** installed. Layers are plain classes, with no application factory or generic interfaces, and no base class except the trigger handler's (ADR 0008).
3. Services and Selectors (and trigger handlers, ADR 0008) are singletons obtained with `getInstance()`. Domain classes, which hold records, are created with `newInstance(records)`.
4. The unit of work is one shared class, `UnitOfWork`, obtained with `newInstance()` and written with the first Service that writes.
5. Unit tests replace dependencies with mocks built on the Apex Stub API, through a test-visible static variable behind `getInstance()` and `newInstance()`.
6. Installing fflib later needs a new ADR, for instance if the in-house unit of work or the mocks become costly to maintain.

## Consequences

- Positive: reviews can point to one rule for where a query, a write or a rule belongs.
- Positive: each level can be tested alone, mostly without a database, and a failure points to one level.
- Positive: no third-party code to install, update, cover with tests or include in a security review.
- Positive: the names follow a widely taught pattern, so moving to the library later keeps the structure.
- Negative: KYP writes and tests its own unit of work, which the library already provides.
- Negative: every such class repeats an accessor and a test variable, and callers depend on the class instead of an interface.
- Negative: the Stub API cannot mock static or private methods or a class with only private constructors, so singletons cannot enforce a single instance with a private constructor.
- Negative: tests with mocks can pass while the real classes fail together, and these principles do not ask for tests across levels.
- Negative: a simple read passes through a Service that does little more than call a Selector.
- Negative: someone who knows fflib may expect base classes that are not there.

## Alternatives considered

- **The same layers with fflib-apex-common:** gives a tested unit of work and common base classes. Rejected for now: it adds third-party code and its base classes to learn for an MVP of at most 5 user stories that mostly reads data, and most of it would be unused at the start.
- **Commit by hand in each Service until a second one repeats it:** less code at first, but a test could not replace the writes with one mock.
- **Pass dependencies through constructors instead of singletons:** dependencies are visible and no static variable is needed, but the project requires the singleton accessor.
- **Selectors and Services only, without a Domain layer:** fewer classes, but per-object rules would end up spread over Services and trigger handlers. A Domain class is still only written when an object has rules (P-17).
- **No layering, logic in controllers and triggers:** quickest to start, but queries and rules get duplicated between entry points and cannot be reviewed against a shared rule.
- **Decide the layers in each technical design:** no commitment now, but designs written in parallel could not be compared and reviewers would have no principle to cite.
