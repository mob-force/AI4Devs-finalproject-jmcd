# ADR 0010: The MVP is view-only and limited to 2GP managed packages

- **Status:** Adopted
- **Date:** 2026-11-27
- **Ticket:** KYP-8

## Context

The MVP is small (the Epic allows at most 5 user stories), while package tooling can reach far into acting on subscriber orgs, licences, usage analytics and other package types. The main goal (ADR 0006) needs dependencies and the version hierarchy.

## Decision

In the MVP phase KYP only shows information, about 2GP managed packages. Dependencies and the version hierarchy tree are included. Push upgrades, licence management, usage analytics, and 1GP, unmanaged and unlocked packages are left out.

## Consequences

- Positive: the scope stays tied to the four reference questions, and KYP changes nothing in subscriber orgs.
- Negative: users still need other tools to act on what they see.
- Negative: Package Visualizer lists features, such as push upgrades, that KYP's MVP will lack.
- Negative: including both diagrams takes room in a small MVP.

## Alternatives considered

The reasons for rejecting these are the assistant's assessment.

- **Include push upgrades or licence management:** acting on data adds risk and scope that the main goal does not need.
- **Cover other package types:** it widens the data and cases to handle without serving the main goal.
- **Leave dependencies or the version tree for later:** the main goal and its measure include them, and seeing them visually makes things easier for the user.
