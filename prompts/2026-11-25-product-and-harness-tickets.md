# Session: Product and harness tickets, ADR rule, product reviewer agent (KYP-7 to KYP-14)

Branches: `docs/KYP-14-adr-rule` (Prompt 4), `chore/KYP-12-product-adversarial-reviewer` (Prompts 5, 6 and 8 to 10), `chore/KYP-4-jira-ticket-format` with `docs/KYP-14-adr-rule` (Prompt 7). Prompts 1 to 3 only changed Jira · Date: 2026-11-25

## Prompt 1

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
I need to create the epic and tasks to build the product documentation for this new product Know your package:
- Record the idea and the main goal of the product
- Create a PRD based on that idea
- Define the User Stories for the MVP no more than 5
Do not perform any change in the repo. The goal is to create the Epic and task in TO-DO status
```

## Prompt 2

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
I need to create an epic to record all the work required to improve the harness of the project. All the tickets in this epic will be tasks and they will be created as they needed, the harness of this project is live and it will be evolving as the project progress
```

## Prompt 3

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
For the epic KYP-11 create two tickets to create two agents:
- Product adversarial reviewer. This agent should challenge, look for edge cases, inconsistencies and issues in the product documentation. He should act as the counterpart of the product team, with the goal of improve the current solution to have a good solution, it's not need to be perfect and if the solution is not better it should be ready to agree with the solution. All the suggestion and changes should justify with proof. Using a different LLM for this agents will be good.
- Product Owner: This agent is acting as product owner defining all the product documentation PRD, user stories, road map and ideas. When it start a jira task the task will be moved to in-progress, a new github branch will be created. when the job is done a pr as a draft will be created and a subagent will be trigger with the Product adversarial reviewer. The summary of the findings should be added as comment in the PR and in any finding location if it's possible
An extra ticket needs to be created to add a rule in the AGENTS.md to always create an ADR with a important decision is taken in the project, can be setup, technical or any other type. The reason in the feature we need to now, the what is already there
The tickets and the epic needs to be in the to-do status
```

## Prompt 4

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
Implement KYP-14, create a dedicated branch and a PR when you finish your work
```

## Prompt 5

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
Implement KYP-12, move the ticket to in-progress, create a dedicated branch and a PR when you finish your work
```

## Prompt 6

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
I didn't meant a different provider, what I meant is a different model
```

## Prompt 7

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
for the adr-1 and 2 re open each of those branches change the status to Adopted and create a PR for each
```

## Prompt 8

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
add in the agent that the findings needs to be added as comment in a PR open with the branch containing the changes
```

## Prompt 9

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
given the script to publish the findings puts each comment in the finding, those findings should be part of the diff of the PR, the need to be visible for whoever is reviewing the PR. If it's not possible at least they need to be in the PR summary comment
```

## Prompt 10

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
create a dedicated folder for the created scripts to group them
```

