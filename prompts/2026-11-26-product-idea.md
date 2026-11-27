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
