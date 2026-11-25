# Product reviewer check: expected results

Run this check after changing the reviewer's instructions or model. Both samples describe a fictional product and are not KYP documentation.

## How to run

Copy one sample alone into an empty folder as `docs/product/prd.md`, with the agent definition under `.claude/agents/`, so the reviewer sees neither this file nor the other sample. From that folder:

```sh
claude -p "Review the product documentation in docs/product/. Do not publish." \
  --agent product-adversarial-reviewer \
  --allowedTools "Read,Grep,Glob" --output-format json
```

## `flawed.md`

Pass: the verdict is `changes_suggested`, every finding has proof, and the planted flaws below are reported.

| # | Planted flaw |
|---|---|
| P1 | The success metric ("employees like the application") cannot be verified and does not measure the goal. |
| P2 | R2 allows booking up to 14 days ahead, while US2 asks for 30. |
| P3 | Nothing defines what happens when two employees book the same desk. |
| P4 | R4 ("must be fast") is not testable. |
| P5 | US3 needs a mobile app, which is out of scope. |
| P6 | US3 refers to R7, which does not exist. |
| P7 | R3 (cancel a booking) has no user story. |

## `sound.md`

Pass: the verdict is `agree`, the agreement is stated explicitly, and there is no `blocker` or `major` finding. Up to three `minor` findings are acceptable.
