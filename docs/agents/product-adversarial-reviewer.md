# Product Adversarial Reviewer

An agent that challenges the product documentation (idea, PRD, user stories, road map). It looks for inconsistencies, edge cases and gaps, proves each finding, and agrees when the solution is good enough. It posts its findings on the open pull request of the branch that contains the changes. It never edits files.

- Definition (instructions, severity levels, output format): `.claude/agents/product-adversarial-reviewer.md`
- Publishing script and the hook that restricts the agent to it: `.claude/scripts/` (tests: `npm test`)
- Why this model and these tools: `docs/adr/0003-product-reviewer-model.md`

## Use it

In a Claude Code session, ask for it by name and say what to review:

> Use the product-adversarial-reviewer agent to review `docs/product/prd.md`.

Without file names it reviews everything under `docs/product/`. To run it on its own from a terminal, from the repository root:

```sh
claude -p "Review docs/product/prd.md" --agent product-adversarial-reviewer \
  --allowedTools "Read,Grep,Glob,WebSearch,WebFetch,Bash(node .claude/scripts/publish-review.mjs:*)"
```

To get the report without posting anything, add "Do not publish." to the request.

## Before it can publish

- The branch with the changes is checked out and has an open pull request (a draft is fine). The agent does not create one.
- The reviewed files are committed and pushed. The script refuses to post if they differ from the pull request.
- `gh` is signed in. Comments are posted under that account and say they come from the agent.
- The folder is trusted in Claude Code, so that the agent's hook runs.
- You allow the publishing command when asked, or pass it in `--allowedTools` as above.

For a **follow-up review**, include the earlier findings and your response to each one. The reviewer marks them `resolved`, `withdrawn` or `open`, and only raises new findings about changed text or a blocker it missed.

The caller must not pass a model when starting the agent, and must itself run on a model other than `claude-opus-5-5`.

## Read the result

The report has two parts: a Markdown summary and a `json` block.

| Verdict | Meaning |
|---|---|
| `agree` | No blocker or major finding. Minor findings are optional. |
| `changes_suggested` | At least one blocker or major finding. |
| `not_reviewed` | The review could not be done. Treat it as a failure, not as agreement. |

## What gets published

One pull request review of type *comment* (it neither approves nor requests changes):

- The summary as the review comment.
- A line comment, with problem, proof and suggestion, for each finding on a line that is part of the pull request diff.
- In the summary, in full, every finding that cannot be placed on a line.

The agent's answer ends with a `**Publication:**` line.

| It says | Meaning |
|---|---|
| `PUBLISHED: <url>` | The comments are on the pull request. |
| `NOT PUBLISHED: <reason>` | Nothing was posted. Fix the cause and run the review again. |

For the caller, such as the Product Owner agent: do not post the findings again. Check that the verdict is not `not_reviewed`, that `model` is `claude-opus-5-5` and that the publication line starts with `PUBLISHED:`. Each run posts a new review, so a follow-up review adds to the earlier one.

The reviewer's findings are suggestions. The product team decides what to change and can argue back with a follow-up review.

## Check it

After changing the instructions or the model, run both samples as described in `docs/agents/product-review-samples/expected-results.md`.

| Date | Sample | Result |
|---|---|---|
| 2026-11-25 | `flawed.md` | Pass: `changes_suggested`, all 7 planted flaws in 6 major findings, 11 of 11 quotes match the file |
| 2026-11-25 | `sound.md` | Pass: `agree`, 2 minor findings, 4 of 4 quotes match the file |

Both runs used only `claude-opus-5-5`, with the read-only definition that preceded publishing. Not covered by this check: follow-up reviews, external (web) proof, and being called as a subagent from another session. Publishing is checked separately with `npm test` and a dry run (`REVIEW_DRY_RUN=1`, which prints what would be posted).
