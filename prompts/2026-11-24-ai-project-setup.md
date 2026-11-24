# Session: AI project setup (KYP-1)

Branch: `chore/KYP-1-AI-project-setup` · Date: 2026-11-24

## Prompt 1

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
/init for a MVP project named Know Your Package with the main purpose is allow ISV partner to have all the current information of their Salesforce 2GP package. Create brief AGENTS.md file and use symlink to refrencet o CLAUDE.md. One rule for the project is that all the prompts need to be added to the prompts.md. Before doing any change create a jira branch called chore/KYP-1-AI-project-setup
```

## Prompt 2

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
add to the AGENTS.md the rule that commits will follow the conventional commits https://www.conventionalcommits.org/es/v1.0.0/
```

## Prompt 3

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
commit the current changes in the branch. push it to github and create a PR
```

## Prompt 4

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
update the origin remote to be mob-force/AI4Devs-finalproject-jmcd. repo ownership has been updated due the Jira integration setup
```

## Prompt 5

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
create a folder called prompts and update the first rule in the agents.md to all the prompts should be logged in a md file per session  in the prompts folder
```

## Prompt 6

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
add to the rule that each prompt should contains the tool used and the model. Update the current prompts md file, commit the changes and upda the pr
```

## Prompt 7

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
remove the changes in the prompts.md file the on in the root folder, the content of the prompt folder should keep without changes. Commit and update the pr
```

## Prompt 8

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
Create a new git branch chore/KYP-3-Setup-Jira-MCP from main branch
```

## Prompt 9

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
setup a Jira MCP server for this project to connect the space Know your pckage (KYP)
```

## Prompt 10

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
move ticket KYP-4 to In-progress
```

## Prompt 11

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
move the tickt KYP-4 tp Done and add a comment indicating that no changes are required as the integration with the MCP it has been done in Claude and it applies to all the projects in which this tool is used
```

## Prompt 12

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
delete the .mcp.json and drop the branch
```

## Prompt 13

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
move ticket KYP-4 ot in progress and move the comment in the ticket to KYP-3. Previous change it should have been in that ticket
```

## Prompt 14

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
Add the Description with the format Why What and How. That should be adapted per each type of tickets to create Epic, Story, Task and bug. Each of this should have a detail level but all should have a format Context (Why), Acceptance Critera/Definition of Done (What), Scope/Details (How)
```

## Prompt 15

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
For the KYP-4 to consider it done we need to have documented in the repo itself the guidance for the creation of tickets (AI will used it). Suggest to me before making any changes in the ticket what were in the repo that guidance will live. We will also need to document that decision in an ADR format, suggest location for this document before doing any change
```

## Prompt 16

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
docs/jira-ticket-guidelines.md + pointer in AGENTS.md, but add a rule specification that any pointer in the AGENTS only will be loaded in the context when is needed. Nothing will be load as long the AGENTS.md when the agents start. ADR format looks greate. Proceed with steps 1, 2 and 3. I need to review the created md files before they are commited
```

## Prompt 17

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (`claude-sonnet-5-5`)

```
proceed with Commit as docs(KYP-4): …, push and open a PR.
```
