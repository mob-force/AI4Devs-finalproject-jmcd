# AAF reviewer panel

Five agents of the Architecture Advisory Forum (AAF) that each review an ADR or technical design document (TDD) from one angle. They advise the author. They give no verdict and change no file. How their reviews are combined into one verdict is described in `docs/agents/aaf-forum.md`.

| Agent | Role | Area |
|---|---|---|
| `aaf-data` | Data Model Advisor | Objects, relationships, keys, data volumes, ownership |
| `aaf-api` | API and Contract Advisor | Service methods, visibility, REST and events, versioning, errors |
| `aaf-platform` | Platform and Scale Advisor | Limits, async work, transactions, order of execution, triggers |
| `aaf-security` | Security Advisor | Sharing, permissions, secrets, AppExchange security review |
| `aaf-skeptic` | Simplicity Advisor | Complexity, simpler options, things built too early |

- Definitions (each agent's area): `.claude/agents/aaf-<area>.md`
- Shared rules, borders between areas, severity tags and output form: `docs/architecture/review-contract.md`
- Why five agents, this model and these tools: `docs/adr/0010-aaf-reviewer-panel.md`

## Use one reviewer

In a Claude Code session, ask for it by name and give one document:

> Use the aaf-security agent to review `docs/architecture/tdd/<file>.md`.

To run it on its own from a terminal, from the repository root:

```sh
claude -p "Review docs/architecture/tdd/<file>.md" --agent aaf-security
```

## What it needs

| Need | If it is missing |
|---|---|
| The path of one readable document | The answer is a single `Blocker` that starts with `Not reviewed:` |
| `docs/architecture/review-contract.md`, from the repository root | The answer is one `Not reviewed:` line |
| The principles in `docs/architecture/principles/` | The review runs, with `none` as the principle of each finding |

Do not pass a model when starting a reviewer. It must run on a different model from the author of the document.

## What it may change

Nothing. A reviewer has only `Read`, `Grep` and `Glob`, so it cannot edit files, run commands, use the web or start other agents. Its review is its answer, and whoever called it decides what to do with it.

## Check it

Run this after changing a reviewer's instructions or model, or the review contract. The sample, `.claude/scripts/aaf-reviewers/sample-tdd.md`, is a fictional design with flaws planted in each area.

Copy only these into an empty folder, so that no reviewer sees this page:

- the five definitions to `.claude/agents/`
- `docs/architecture/review-contract.md` and `docs/architecture/principles/` to the same paths
- the sample to `docs/architecture/tdd/0001-visit-sync.md`

From that folder, run each reviewer. The answers are saved outside it, so that no reviewer reads another one's:

```sh
for area in data api platform security skeptic; do
  claude -p "Review docs/architecture/tdd/0001-visit-sync.md" --agent "aaf-$area" \
    --allowedTools "Read,Grep,Glob" --output-format json > "../aaf-$area.json"
done
```

A reviewer passes when:

- its answer has exactly the form in the contract, with at most 5 findings
- it reports the planted flaws of its area
- no finding belongs to another reviewer's area
- each cited principle exists and says what the finding relies on
- only `claude-opus-5-5` was used, and no file changed

| Reviewer | Planted flaws it should report |
|---|---|
| `aaf-data` | Optional lookup although a visit cannot exist without its site; no external ID to match visits to the scheduling system; visits kept for ever at this volume; site filtered through a copied text field |
| `aaf-api` | Repeated calls insert duplicates; status 200 with free text for rejected visits; no version; `global` notification interface with no caller outside the package |
| `aaf-platform` | One query and one callout per record in a trigger, with up to 2,000 visits in a call; callout inside the insert transaction |
| `aaf-security` | API key readable by all users and no Named Credential; `without sharing` and no permission checks, against the rule on what technicians may see |
| `aaf-skeptic` | Plug-in framework when email is the only channel requested; custom cache object and job to copy data already in Salesforce |

Each reviewer has room for 5 findings, so further reasonable findings in its area do not make it fail.

| Date | Sample | Result |
|---|---|---|
| 2026-11-28 | `sample-tdd.md`, through `/forum-review` on the four AAF branches combined, in a folder without this page | Every planted flaw reported, at most 5 findings each, only `claude-opus-5-5`, and only the review record written. `aaf-security` once gave three principle IDs instead of one. Some problems were reported by three reviewers, from different angles. Cited IDs exist; whether each supports its finding was judged by the chair, not by hand |

`npm test` checks that each definition keeps its tools and model and refers to the contract without copying it. It does not check what a reviewer answers.
