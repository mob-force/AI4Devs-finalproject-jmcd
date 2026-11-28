# Architecture patterns

How Know Your Package (KYP) code and data are structured. Naming is in [conventions.md](conventions.md); Salesforce limits, security and packaging rules are in [platform-guardrails.md](platform-guardrails.md).

## Using the principles

For all three files. A statement without a source marker (`[S1]`) is the project's choice or reasoning.

- Cite a principle by its ID, e.g. `violates P-07`, without repeating it.
- IDs are unique across the three files and stable: never renumbered or reused. A new principle takes the number after the highest one in any file; a withdrawn one stays, marked **Withdrawn**.
- A design may depart from a principle if it names the ID and gives the reason. Changing a principle, or making an exception that lasts, needs an ADR (`docs/adr/`).

## Apex layers

Calls go from an **entry point** to a **Service**, which uses **Domain** classes, **Selectors** and **clients**. The layers follow the Apex Enterprise Patterns [S1] without the fflib library ([ADR 0007](../../adr/0007-apex-layering.md)).

| ID | Rule | Why |
|---|---|---|
| P-01 | Calls point down only (entry point, then Service, then Domain, Selector or client); a lower layer never calls a higher one. | Each layer can be changed and tested without its callers. |
| P-02 | Entry points (`@AuraEnabled`, REST, invocable and asynchronous classes) only translate input and output and call a Service; triggers follow P-08 and P-09. | Every caller gets the same behaviour. |
| P-03 | A Service owns one use case and its transaction; its methods accept collections and no UI or trigger context types. | One method serves any volume and caller. |
| P-04 | Only Services run DML: each use case registers its changes in a unit of work (P-47) and commits it once, parents first, rolling all back on failure unless the design states partial success. | Saves DML statements and leaves no half-written data. |
| P-05 | A Domain class holds the rules of one object, works on collections of records it is given, and runs no SOQL, DML or callouts. | Rules sit in one place and need no database. |
| P-06 | Each external API has one client class, called only by Services and replaceable in tests. | Request, response and error handling stay in one place. |
| P-07 | All SOQL lives in Selectors, one per queried object, and a Selector only reads. | One place to review queries and access. |
| P-46 | Services, Selectors and trigger handlers are singletons, got with static `getInstance()` and never `new`; they have instance methods and keep no state between calls. | One place to swap in a mock; nothing left over. |
| P-47 | Each use case gets its own unit of work from static `UnitOfWork.newInstance()`. | Pending changes never mix. |

## Triggers

A small in-house base class, written with the first trigger ([ADR 0008](../../adr/0008-trigger-framework.md)).

| ID | Rule | Why |
|---|---|---|
| P-08 | Each object has at most one trigger, which only calls the object's handler. | Several triggers have no guaranteed order [S2]. |
| P-09 | A handler extends the shared `TriggerHandler` base class and only routes each trigger context to Domain or Service methods; work that needs SOQL, DML or callouts goes through a Service. | Triggers look alike and hold no logic of their own. |
| P-10 | Automation on app objects is written in Apex, with no record-triggered flows. | No logic split across the save order [S2]. |
| P-11 | Trigger logic prevents repeats by acting only on records whose relevant values changed, not with a static "already ran" flag. | A flag can skip records on a retry [S2]. |
| P-48 | Each trigger handler can be disabled by a checkbox of a hierarchy custom setting, checked by the base class; with no value it runs. | Switched off per org, profile or user, without deploying [S7]. |

## Unit tests

| ID | Rule | Why |
|---|---|---|
| P-49 | `getInstance()` and `newInstance()` (Domain classes have `newInstance(records)`) return the mock a test set in a `@TestVisible` private static variable; none of these classes has only private constructors. | The Stub API mocks no static method or such class [S6]. |
| P-50 | A unit test mocks every dependency of the class under test (Stub API [S6], `HttpCalloutMock` for callouts) and asserts only that class's responsibility. Only tests of Selectors, the unit of work, triggers and the P-48 setting use the database. | A failure points to one level. |

## Data model

| ID | Rule | Why |
|---|---|---|
| P-12 | The app stores its data only in custom objects: no standard object holds app data or gets an app field. | A project constraint (KYP-20). Sources can include standard objects, as the LMA creates `Lead` records [S3]: a design names each one it reads. |
| P-13 | Use master-detail only when the child cannot exist without the parent and the parent should control its access; otherwise use a lookup. | It ties the child's access and deletion to the parent [S4]. |
| P-14 | Different fields, relationships or access mean separate objects; record types are only for variants of one thing. | No fields that most records leave empty. |
| P-15 | Every loaded object has a unique external ID from the source record's identifier, and loads upsert on it. | Reloading adds no duplicates; the field is indexed [S5]. |

## Contracts and simplicity

| ID | Rule | Why |
|---|---|---|
| P-16 | Every operation offered to a caller states its input, output, errors and whether repeating it is safe; errors expose no internal detail. | Callers can be built and reviewed against the contract. |
| P-17 | Build only what a current requirement needs, and name it: no class, object, interface, setting or asynchronous step for a possible future one. | Less to build, review and keep secure. |
| P-18 | Use a standard platform feature when it meets the requirement before writing custom code, except where P-10 applies. | The platform maintains it. |

## Sources

Checked on 2026-11-28. [S1] Trailhead: [Domain and Selector layers](https://trailhead.salesforce.com/content/learn/modules/apex_patterns_dsl) and [Service layer and Unit of Work](https://trailhead.salesforce.com/content/learn/modules/apex_patterns_sl) (module outlines only) · [S2] [Triggers and Order of Execution](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-triggers-order-of-execution.html) · [S3] [Lead and License Records in the LMA](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/lma-terms-relationships.html) · [S4] Trailhead: [Object Relationships](https://trailhead.salesforce.com/content/learn/modules/data_modeling/object_relationships) · [S5] [Large data volumes: Indexes](https://developer.salesforce.com/docs/platform/salesforce-large-data-volumes-bp/guide/ldv-deployments-infrastructure-indexes.html) · [S6] [Stub API](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-testing-stub-api.html) · [S7] [Custom settings](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-customsettings.html)
