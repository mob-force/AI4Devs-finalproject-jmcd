# ADR 0011: The MVP assumes the Dev Hub and the LMA are in one org

- **Status:** Adopted
- **Date:** 2026-11-27
- **Ticket:** KYP-8

## Context

Package and version records are in the Dev Hub, and customer and licence information is in the License Management App (LMA). Whether they share an org changes what a tool inside Salesforce has to reach.

## Decision

For the MVP, the org that KYP describes is the partner's Dev Hub, and the LMA is in that same org. A later technical definition can cover other setups.

## Consequences

- Positive: the MVP is simpler.
- Negative: partners whose Dev Hub and LMA are in different orgs are not covered by the MVP.
- Negative: that all the data can be obtained within one org is still to be verified (assumption A10).

## Alternatives considered

The reasons for rejecting these are the assistant's assessment.

- **Support separate orgs from the start:** it adds cross-org access to the MVP.
- **Leave out LMA data:** answering in terms of customers, part of the main goal, probably needs it (assumption A4).
