# Product Owner agent

An agent that writes the product documentation (idea, PRD, user stories, road map) one Jira task at a time, and has it challenged by the [adversarial reviewer](product-adversarial-reviewer.md).

- Definition (role, rules, workflow): `.claude/agents/product-owner.md`
- Workflow script and the hook that limits the agent: `.claude/scripts/product-owner/` (tests: `npm test`)
- Why it is built this way: `docs/adr/0004-product-owner-agent.md`

## Use it

From the repository root, on an up to date `main`:

```sh
claude --agent product-owner
```

Then give it a task: `Work on KYP-8`.

Run it as the main session, as above, not as a subagent. Only then can it ask you product questions, and only then does Claude Code limit it to starting the reviewer.

## Before you start

| Need | How to check |
|---|---|
| The agent and its scripts are merged into `main` | It creates task branches from `origin/main` |
| No uncommitted changes to tracked files, and no new files in the folders it writes | `git status` |
| The task is in **To Do**, with no branch or pull request yet | Jira, GitHub |
| Jira access through the claude.ai connector named **Atlassian MCP** | `/mcp` |
| `gh` signed in with write access, and push access to `origin` | `gh auth status` |
| The folder is trusted in Claude Code, so that the hooks run | Accept the trust dialog |
| Do not pass `--model` with Claude Opus 5.5 | The reviewer must run on a different model |

## What it does

1. Reads the task and checks that it can start.
2. Moves it to **In Progress**, creates `<type>/KYP-<n>-<slug>` from `main` and pushes it.
3. Writes the documents, logs the prompts, commits.
4. Opens a **draft** pull request.
5. Starts the reviewer, which posts its summary and line comments on the pull request.
6. Confirms that the review is on the latest commit, and reports.

It stops there. Acting on the findings, marking the pull request ready, merging and moving the task to Done are yours.

## When it stops early

It reports the reason and what was already done. It does not resume a task by itself, so clean up first.

| Reason | What to do |
|---|---|
| Task already In Progress or Done | Pick another task, or move it back to To Do if it should be redone |
| Branch or pull request already exists | Finish or delete it |
| Uncommitted changes | Commit, stash or ignore them |
| Jira or GitHub unavailable | Restore access, then check which steps ran |
| Review failed | The draft pull request exists. Run the reviewer on it (see its guide) |

## What it cannot do

Enforced by the tool list and the hook, not only by its instructions:

- The only shell command is the workflow script, which has no merge, ready or force-push action. Its requests go through `.agent-tmp/po-request.json` (`docs/adr/0005-agent-requests-through-files.md`).
- It writes only `docs/product/`, `prompts/`, `prompts.md`, `readme.md` and its request file. It writes no ADRs (`docs/adr/0006-adrs-for-architecture-and-process.md`).
- It starts only the reviewer, without overriding its model.
- In Jira it reads tickets and moves one to **In Progress**. It cannot create or edit tickets.

Claude Code skips agent hooks in a folder that is not trusted. There only the permission settings limit the agent, so do not combine it with broad shell or edit permissions.
