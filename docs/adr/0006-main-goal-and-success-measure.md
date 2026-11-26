# ADR 0006: Main goal of Know Your Package and how it is measured

- **Status:** Proposed
- **Date:** 2026-11-26
- **Ticket:** KYP-8

## Context

KYP-8 asks for a single main goal and a way to know it is achieved. Every PRD requirement has to support that goal (KYP-9) and the MVP has to fit in 5 user stories (Epic KYP-7), so the goal fixes what the MVP can contain and is costly to change later.

The input for the task asks for visual views of packages, versions, dependencies, version hierarchy, customers and orgs. It states no goal or measure. There are no users yet, no user research and no measurement of the current situation.

## Decision

The main goal is visibility: an ISV partner can see, in one visual place inside Salesforce, which packages and versions exist, how they relate, and which customers run each version.

It is measured at the MVP acceptance test with four reference questions that must all be answered correctly, each in under 1 minute, using only KYP. The questions and test conditions are in `docs/product/idea.md`.

## Consequences

- Positive: the measure is testable with the MVP alone and needs no real users or usage history.
- Positive: it covers each kind of view in the task input, so the PRD can trace requirements to a question.
- Negative: it shows that the product can answer the questions, not that partners want it or that it saves them time.
- Negative: the four questions pull dependencies and version hierarchy into the goal. If the PRD leaves either out of the MVP, the goal and measure must change with it.
- Negative: the target values and the definition of an active customer are not validated.

## Alternatives considered

- **Move customers to the latest version:** rejected because it would call for acting on subscriber orgs, such as push upgrades, which the task input does not ask for, and its result depends on customers over a period longer than an MVP test.
- **Adoption, such as the number of partners using KYP:** rejected because there are no users and no means to reach this number within the project.
- **Time saved compared with today:** rejected for now because there is no baseline. It can replace the time limit once the current way of answering has been timed.
- **One goal per view:** rejected because the task requires a single main goal.
- **A goal limited to who runs which version:** smaller, but it leaves out the dependency and hierarchy views requested in the task input.
