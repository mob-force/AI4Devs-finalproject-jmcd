# Session 2026-11-26: product idea and main goal (KYP-8)

Prompts sent in the main session, which delegated the work to the `product-owner` agent. Prompt 3 was sent after interrupting a question from the assistant.

## Prompt 1

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
use @"product-owner (agent)" to implement the ticket KYP-8
```

## Prompt 2

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
@"product-owner (agent)" for the ticket KYP-8
```

## Prompt 3

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
@"product-owner (agent)" implement the KYP-8 

<pasted_content>
The project should implement a tool build within Salesforce to have:
- Summary information of packages created in the org in the more visual way possible
  - Number of packages
  - Active customers per versions in package
  - Latest version created per package
- List of package and package details including related versions or subscribed customers
  - View of the package dependency
- List of versions and version details including related customers and orgs by version
  - View of the hierarchy tree of the versions
</pasted_content>
```
