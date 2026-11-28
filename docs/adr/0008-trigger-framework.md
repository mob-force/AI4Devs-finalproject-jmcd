# ADR 0008: A minimal in-house trigger framework

- **Status:** Proposed
- **Date:** 2026-11-28
- **Ticket:** KYP-20

## Context

Salesforce does not guarantee the order of several triggers on the same object and event, and a trigger that holds logic is hard to test and reuse. A shared way to write triggers has to be agreed before the first one, because changing it later means rewriting every trigger and handler.

The project requires that trigger handlers are singletons and can be disabled with a custom setting, and that each level is unit tested with mocks.

All KYP objects are custom, and the MVP only shows information (decision D5 in `docs/product/idea.md`). Whether it needs any trigger is not yet designed (KYP-17).

## Decision

1. KYP uses its own minimal framework: one trigger per object, which only calls `<Objects>TriggerHandler`, a singleton class extending a shared `TriggerHandler` base class.
2. The base class dispatches the trigger context to methods that a handler overrides, unless the handler is disabled in a hierarchy custom setting; with no setting value the handler runs. Loop counters, configurable ordering and other settings are added only when a requirement needs them.
3. The base class is written with the first trigger, not before.
4. Handlers route to Domain and Service classes (ADR 0007). Automation on app objects is Apex, with no record-triggered flows.

The rules are principles P-08 to P-11, P-46 and P-48 to P-50 in `docs/architecture/principles/patterns.md`.

## Consequences

- Positive: one small class and one custom setting to understand, with no dependency.
- Positive: a handler can be switched off without a deployment, for instance during a data load.
- Positive: the order of what runs on an object is read in its handler.
- Negative: KYP writes and tests the base class itself.
- Negative: features that existing frameworks already have, such as loop limits, have to be added by hand when needed.
- Negative: while a handler is disabled its rules do not run, so records can be saved that break them.
- Negative: a managed package carries the custom setting's definition but no values, and its visibility decides whether the subscriber can change them.
- Negative: administrators cannot add or reorder automation without code, and flows are ruled out for app objects even where a flow would be simpler.

## Alternatives considered

- **[Trigger Actions Framework](https://github.com/mitchspano/trigger-actions-framework)** (Apache-2.0): orders and bypasses Apex and Flow actions through custom metadata. Rejected: its switches use custom metadata rather than the required custom setting, its flexibility serves orgs where several people or teams add automation to the same objects, which KYP does not have, and it adds a dependency and configuration to maintain.
- **[sfdc-trigger-framework](https://github.com/kevinohara80/sfdc-trigger-framework)** (MIT): a single base class with bypass and loop limits, close to this decision. Rejected: it is third-party code to copy and maintain anyway, its last push was in March 2024 when checked on 2026-11-28, and its extra features are not needed yet.
- **The trigger handling of fflib's Domain class:** depends on the library that ADR 0007 leaves out, and ties Domain classes to the trigger context.
- **A handler class per object without a base class:** nothing shared to write, but each handler repeats the context dispatch in its own way.
- **Logic directly in triggers:** hard to test or reuse, and it breaks the layering of ADR 0007.
- **A custom metadata switch:** deployable with the app, but a custom setting was required, and a hierarchy setting can also disable a handler for one profile or user.
- **A list custom setting:** simple to read, but it has no value per profile or user.
- **Record-triggered flows for automation:** no code for simple cases, but logic would be split between two places that run at different points of the save order.
