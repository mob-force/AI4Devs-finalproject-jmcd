# Architecture review forum

The Architecture Advisory Forum (AAF) reviews one ADR or technical design document (TDD) at a time. `/forum-review` has five reviewers look at it in parallel, and a chair turns their findings into one verdict and a review record.

- Command (the steps the main session follows): `.claude/skills/forum-review/SKILL.md`
- Chair (merging, rulings, verdict, record format): `.claude/agents/aaf-chair.md`
- Hook that limits the chair: `.claude/scripts/aaf-forum/` (tests: `npm test`)
- Why it is built this way, and the chair's model: `docs/adr/0011-forum-review-command-and-chair.md`

## The workflow

| Step | Who | What happens | Details |
|---|---|---|---|
| 1. Draft | You and the author agent | An ADR in `docs/adr/` or a TDD in `docs/architecture/tdd/` is written | `docs/agents/aaf-author.md` |
| 2. Start | You | `/forum-review <path>` in a Claude Code session | [Run it](#run-it) |
| 3. Review | Five reviewers, in parallel | Each returns its findings and what it leaves to development. They write nothing | `docs/agents/aaf-reviewers.md` |
| 4. Verdict | The chair | Merges duplicates, settles conflicts, gives the verdict and writes the record | [The record](#the-record) |
| 5. Revise | You and the author agent | The author changes the document to resolve the issues in the record | `docs/agents/aaf-author.md` |
| 6. Review again | You | After a revision, run the command again until you are satisfied with the verdict | |

You start every step. Nothing revises the document, changes its status or commits by itself.

## Run it

From a session in the repository root:

```
/forum-review docs/adr/0007-<slug>.md
```

A pattern works if it matches one file, such as `/forum-review docs/adr/0007-*.md`. Use a normal session: an `aaf-author` session cannot start the reviewers. A session that drafted the document as a subagent will do, because the reviewers get only the path, and the chair gets the path, the date and their answers.

Only you can start it: Claude cannot run the command on its own. In a terminal, without a session:

```sh
claude -p "/forum-review docs/adr/0007-<slug>.md" --allowedTools "Edit(docs/architecture/reviews/**)"
```

## Before you start

| Need | Why |
|---|---|
| The reviewers, the chair and `docs/architecture/review-contract.md` are on your branch | The command stops if an agent is missing, and the chair if the contract is |
| The folder itself is trusted in Claude Code | Otherwise the hook that limits the chair does not run. Trusting only a parent folder is not enough, and `claude -p` never asks |
| The earlier record is committed, when reviewing again | The new record replaces it, and Git keeps the history |
| You allow the chair to write the record when asked, or pass it in `--allowedTools` as above | Without it no record is written. The reviewers' permissions are in their guide |

## The record

One file per document, `docs/architecture/reviews/ADR-NNNN-review.md` or `TDD-NNNN-review.md`. It holds the verdict, every finding with its reviewer, tag, principle and the chair's ruling, the merged issues with the required changes, and what each reviewer left to development.

When each verdict applies is defined in the chair's definition.

| Verdict | What you do |
|---|---|
| `Accepted` | Take the suggestions or not. Confirming the document is still your decision |
| `Accepted with changes` | Have the author make the required changes |
| `Rejected` | Have the author revise the document, then review it again |

To revise, give the author the record: ask it to resolve the issues in `docs/architecture/reviews/ADR-0007-review.md`. If you disagree with a ruling, the decision is yours. Say so in the document, so that the next review can judge your reason.

A verdict is advice. It neither changes the status of an ADR nor blocks a pull request, and it is not posted on pull requests.

## When it stops early

| Report | What to do |
|---|---|
| No single document matched | Pass the path of one ADR or TDD |
| An agent is missing | Check your branch and `/agents` |
| A reviewer failed or answered about something else | Run the command again. Nothing was written |
| `NOT RECORDED: <reason>` | Fix the cause and run the command again |

## What the chair cannot do

Enforced by its tool list and the hook, when the folder is trusted:

- It reads files and writes with one tool, `Write`. It has no shell, edit, web or agent tools.
- It writes only a review record, and only one that names an existing document with the same type and number.

Followed by instruction only:

- Writing the record of the document under review, and no other record. The hook does not know which document that is.
- The record's content, including listing every finding, and the rules for rulings and verdicts.
- Everything the main session does: starting all five reviewers, passing their answers on unchanged and writing no file itself.

So read the record before you commit it. A model set for the call or `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` overrides the pinned model, so check the `Chair model` line too.

## Check it

`npm test` covers the hook and the chair's tool list, model and hook entry. It does not run the forum.

The forum has not been run yet: it needs the author and reviewers. To check it, run `/forum-review` on one ADR or TDD and confirm that:

- the five reviewers run at the same time, and the chair starts only after all have answered,
- the record is the only file that changed (`git status`),
- every finding of the five answers is in the findings table, and the verdict follows from the rulings,
- the record names `claude-opus-5-5` as chair model.
