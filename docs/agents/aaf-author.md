# AAF author agent (Solution Architect)

The author of the Architecture Advisory Forum (AAF). It drafts ADRs and technical design documents (TDDs) for the reviewer panel and revises them after a review. It writes no code: an adopted document is the handoff to development, which fills in the detail.

- Definition (role, rules, level of detail): `.claude/agents/aaf-author.md`
- Hook that limits what it changes: `.claude/scripts/aaf-author/` (tests: `npm test`)
- Formats: `docs/adr/README.md` and `docs/architecture/tdd/README.md`
- Why it is built this way: `docs/adr/0009-aaf-author-agent.md`
- The review that follows: `docs/agents/aaf-forum.md`

## Use it

From the repository root, on the branch of the task:

```sh
claude --agent aaf-author
```

Then say what you need, for example:

- `Draft the TDD for KYP-17`
- `Draft an ADR on <decision>, ticket KYP-<n>`
- `Revise docs/architecture/tdd/<file>.md after its review. Apply I1 and I3`

Run it as the main session, as above, so that it can ask you questions. It also works as a subagent of another session: it then records assumptions and open questions, or stops. Do not pass a model.

To run it once without a conversation:

```sh
claude -p "Draft an ADR on <decision>, ticket KYP-<n>" --agent aaf-author \
  --allowedTools "Read,Grep,Glob,WebSearch,WebFetch,Edit(docs/adr/**),Edit(docs/architecture/tdd/**),Edit(prompts/**)"
```

If the request needs a Jira ticket read, add the Jira tools listed in the definition to `--allowedTools`.

## What it needs

| Need | Why or how to check |
|---|---|
| The branch of the task is checked out | It has no shell, so it cannot create or check branches |
| `docs/architecture/principles/` | It stops without them |
| The documents the design depends on, such as the product documentation | Without them it asks whether to go on with assumptions, or stops |
| Jira access through the claude.ai connector named **Atlassian MCP**, when you name a ticket | `/mcp` |
| The folder is trusted in Claude Code, so that the hook runs | Accept the trust dialog. A `-p` run does not count as trusting it |
| Not running on Claude Opus 5.5 | The reviewers must run on a different model |

## What it does

1. Reads the principles, the format, the ticket and the related documents.
2. Asks about choices that change the design.
3. Writes the document as `Proposed` and adds its index row.
4. Reports the decision, the principles cited, open questions and unmet criteria.

It stops there. Committing, opening the pull request, running `/forum-review` (in a normal session, as this agent cannot start the reviewers), setting a document to `Adopted` (in the file and in the index) and merging are yours. After a review, ask it to revise: it says what it did with each issue of the review record and leaves the record untouched.

## What it may change

| Files | Allowed change |
|---|---|
| `docs/adr/NNNN-<slug>.md`, `docs/architecture/tdd/NNNN-<slug>.md` | Create them, or revise them while `Proposed`. They stay `Proposed` |
| `README.md` in those two folders | Add or change the index rows of `Proposed` documents. No row is removed |
| `prompts/YYYY-MM-DD-<slug>.md` | The prompt log |

Everything else is refused, including adopted documents, principles, review records and its own definition and hook. It has no shell, starts no subagents and only reads Jira.

These limits are enforced by the tool list and the hook. Two things rest on its instructions alone: the level of detail with the principle citations, and keeping to the documents of the current task (the hook accepts any `Proposed` document and any prompt log). Check them in the diff.

Claude Code skips agent hooks in a folder that is not trusted. There only the permission settings limit the file tools, so do not combine the agent with broad edit permissions.

## Check it

After changing the instructions or the model, have it draft one document on a scratch branch and check that:

- it has context, options, decision and consequences, is `Proposed` and has its index row;
- every principle ID it cites exists in `docs/architecture/principles/` and says what the document relies on;
- it holds no code beyond method signatures or object and field names;
- `git status` shows changes only in the files above.

| Date | Sample | Result |
|---|---|---|
| 2026-11-28 | An ADR on reporting Apex errors, run headless on the four AAF branches combined | Passed the four checks. No Salesforce page could be fetched, so platform facts were labelled assumptions. A first run on `main` stopped without writing, as instructed. The hook was not verified, as the folder was not trusted |
