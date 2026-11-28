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

## Prompt 4

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
apply the suggestion of F1 in the idea.md file
```

## Prompt 5

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
<pasted_content>
1. Should KYP replace Package Visualizer, complement it, or do something else? It should be an alternative in the market, free as the Package Visualizer but with a better UX
2. Is an active customer one with the package installed in at least one production org? That's the definition
3. Is 4 of 4 questions, each under 1 minute, the right target? Yeah, make things easy for a user is the main goal of KYP
4. Is KYP view-only, excluding push upgrades, licence management, usage analytics and other package types? In the MVP phase yes
5. Is "the org" your Dev Hub, and is the License Management App in the same org? Yeah, that's the assumption. Future technical definition can cover other escnearios, but to simplify the MVP that's the assumption
6. Must the dependency view and version tree be in the MVP? Yeah, makes things easy and visual for user, what is one of the goals
7. Should "latest version created" include betas (F3)? Yeah, both should be displayed, latest promoted version and latest beta version
8. Which role at the ISV partner is the main user? Package Owner
9. Do you adopt ADR 0006 and ADR 0007? ADR 0007 is marked Proposed. Both needs to be adopted


Apply the required changes, commit the changes and push it to github
</pasted_content>
```

## Prompt 6

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
create a ticket for the epic KYP to improve the ADR rules and creation. ADR should be created to track architectural decisions (e.g. Framework to use for the UI, patterns to use)  and project process decisions (e.g. we will use OpenSpec, what is the Jira format of the tickets). Product decisions should be sel-contained in the prouct documentation. As result of this change the ADRs from 0006 to 0011 neds to be deleted
```

## Prompt 7

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
implement ticket KYP-15
```

## Prompt 8

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
keep sequence of ADRs ADR-0012 should be ADR-0006
```

## Prompt 9

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
create a new subagent that looks for duplicated information regarding the latest changes. Give the list of what is the information appearing multiple times, where and suggest me how to solve that
```

## Prompt 10

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
Fix c1 to c8 with your suggestion
```

## Prompt 11

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
commit the changes made in the ticket and create a PR
```

## Prompt 12

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
@"product-owner (agent)" implement KYP-9 user story using the docs/product/idea.md as starting point
```

## Prompt 13

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
apply suggested fix for the mayor findining
```

## Prompt 14

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
in the current PRD remove any technical reference, including data model or data already in Salesforce. That should be cover on the architect, technical and data model design
```

## Prompt 15

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
Update the PRD> in the package detail page the list of related version and customers should be also show. In the version the customer and orgs with that version should be displayed as single list
```

## Prompt 16

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
change State after this document of each  assumption on he PRD to validated by the criteria of the human product owner. You can tag me for future knowledge
```

## Prompt 17

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
Risk related with data can be mitigated given the data model of the app to be created should contain all the required objects. How those table were be seeded are not part of the MVP. Manual data load will be use for the MVP to check that the app works as expected. Data sync with the org data or any other required data sources is out of the scope of the MVP and can be part of next phases as other features have been listed. Update the PRD
```

## Prompt 18

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
commit the latest changes on the PRD, prompts and readme and push it to github
```
