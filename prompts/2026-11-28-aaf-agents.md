# Session 2026-11-28: Architecture Advisory Forum (KYP-20 to KYP-23)

Prompt sent in the main session, which started one agent per ticket, each in its own git worktree.

## Prompt 1

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
create an agent per ticket for the following tickets, implement them in parallel KYP-20,  KYP-21,  KYP-22 and  KYP-23. Create a branch per ticket and a PR per ticket to main. Once all the subagent have finsihed review that no conflict will appear between branches, there are no discrepencies and no duplications
```

## Prompt 2

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
In the patterns on architectural principles include:
- the use of singleton in services, selectors and triggerHandler
- use the newinstance patter for UOW 
- Triggerhandler needs to be disable by custom settings
- Unit test will requier mocks to only test the responsability of each level
Update any other document related 
```

## Prompt 3

- Tool: Claude Code
- Model: Claude Sonnet 5.5 (claude-sonnet-5-5)

```text
commit changes and push them
```
