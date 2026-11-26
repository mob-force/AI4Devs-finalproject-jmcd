# ADR 0007: Know Your Package is a tool used inside Salesforce

- **Status:** Proposed
- **Date:** 2026-11-26
- **Ticket:** KYP-8

## Context

The input given for KYP-8 says the project should be a tool built within Salesforce. Where the product lives shapes who can use it, which data it can reach and how it compares with existing tools, and it is costly to reverse.

KYP-8 puts technical decisions out of scope. This record covers only the product side, which is where the partner uses the product. It chooses no technology, architecture, data source or distribution method.

## Decision

KYP is a tool that the ISV partner uses inside Salesforce.

## Consequences

- Positive (assumed): partners get the information in the platform where they already manage their packages, without another application to sign in to.
- Negative: what the product can show is limited to what can be obtained from within Salesforce, which is not yet verified (assumption A10 in `docs/product/idea.md`).
- Negative: it competes directly with Package Visualizer, a free Salesforce Labs app that also works inside Salesforce.
- Open: which org the tool runs in and how a partner would install it.

## Alternatives considered

The task input states the decision without giving reasons or alternatives. These are the Product Owner's assessment.

- **Web application outside Salesforce:** not chosen because it goes against the task input. It would also require partners to give an external service access to their org data.
- **Command-line plugin:** not chosen because it goes against the task input and would not help users who do not work with the command line.
