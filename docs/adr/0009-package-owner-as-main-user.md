# ADR 0009: The Package Owner is the main user

- **Status:** Adopted
- **Date:** 2026-11-27
- **Ticket:** KYP-8

## Context

The product idea targets ISV partners, where several roles may need information about packages. A better user experience (ADR 0008) cannot be designed or tested without knowing whose experience comes first.

## Decision

The main user of KYP is the Package Owner, the person at the ISV partner who is responsible for its packages.

## Consequences

- Positive: user stories and design choices have one primary user to serve.
- Negative: what this role needs has not been validated with users (assumption A2).
- Negative: other roles may be served less well.

## Alternatives considered

The reasons for rejecting these are the assistant's assessment.

- **Developers or release engineers:** they are likely to be comfortable with the command line, where much of this information is already available.
- **Product or support roles:** they may need these answers, but are not the people responsible for the packages.
- **No primary user:** it gives no way to settle conflicting needs.
