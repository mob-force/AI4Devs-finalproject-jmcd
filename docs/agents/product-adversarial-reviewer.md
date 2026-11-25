# Product Adversarial Reviewer

An agent that challenges the product documentation (idea, PRD, user stories, road map). It looks for inconsistencies, edge cases and gaps, proves each finding, and agrees when the solution is good enough. It never edits files.

- Definition (instructions, severity levels, output format): `.claude/agents/product-adversarial-reviewer.md`
- Why this model and these tools: `docs/adr/0003-product-reviewer-model.md`

## Use it

In a Claude Code session, ask for it by name and say what to review:

> Use the product-adversarial-reviewer agent to review `docs/product/prd.md`.

Without file names it reviews everything under `docs/product/`. To run it on its own from a terminal:

```sh
claude -p "Review docs/product/prd.md" --agent product-adversarial-reviewer
```

For a **follow-up review**, include the earlier findings and your response to each one. The reviewer marks them `resolved`, `withdrawn` or `open`, and only raises new findings about changed text or a blocker it missed.

The caller must not pass a model when starting the agent, and must itself run on a model other than `claude-opus-5-5`.

## Read the result

The report has two parts: a Markdown summary and a `json` block.

| Verdict | Meaning |
|---|---|
| `agree` | No blocker or major finding. Minor findings are optional. |
| `changes_suggested` | At least one blocker or major finding. |
| `not_reviewed` | The review could not be done. Treat it as a failure, not as agreement. |

## Publish it on a pull request

For the caller, such as the Product Owner agent:

1. Check that the report has a verdict and that `model` is `claude-opus-5-5`. If not, report the failure instead of publishing it as a review.
2. Post the Markdown summary as a pull request comment.
3. For each finding whose `file` and `line` are part of the pull request diff, add a line comment with its severity, problem, proof and suggestion.
4. Findings that cannot be placed on a line (`line` is `null`, or the line is outside the diff) must appear in full in the summary comment.

The reviewer's findings are suggestions. The product team decides what to change and can argue back with a follow-up review.

## Check it

After changing the instructions or the model, run both samples as described in `docs/agents/product-review-samples/expected-results.md`.

| Date | Sample | Result |
|---|---|---|
| 2026-11-25 | `flawed.md` | Pass: `changes_suggested`, all 7 planted flaws in 6 major findings, 11 of 11 quotes match the file |
| 2026-11-25 | `sound.md` | Pass: `agree`, 2 minor findings, 4 of 4 quotes match the file |

Both runs used only `claude-opus-5-5`. Not covered by this check: follow-up reviews, external (web) proof, and being called as a subagent from another session.
