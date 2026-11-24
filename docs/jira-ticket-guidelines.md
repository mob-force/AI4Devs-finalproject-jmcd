# Jira ticket guidelines

Use this guide when creating or editing Jira tickets in the **KYP** project (Know Your Package). It applies to people and AI assistants alike. The decision behind it is recorded in [ADR 0001](adr/0001-jira-ticket-format.md).

## Format

Every ticket description has the same three sections, in this order:

| Section | Answers |
|---|---|
| **Context (Why)** | Why the work is needed and what value it brings |
| **Acceptance Criteria / Definition of Done (What)** | What must be true for the ticket to be Done |
| **Scope / Details (How)** | How it will be done, plus what is in and out of scope |

The level of detail depends on the issue type (see below). Acceptance criteria must be verifiable (a checklist or Given/When/Then), never vague.

## Templates by issue type

### Epic (high level)

```markdown
## Context (Why)
Business problem or goal, target users (ISV partners), expected outcome or metric.

## Acceptance Criteria / Definition of Done (What)
- [ ] Measurable outcome(s) that close the Epic
- [ ] All child Stories are Done

## Scope / Details (How)
In/out of scope, main approach and milestones, dependencies, risks. No implementation detail.
```

### Story (functional detail)

```markdown
## Context (Why)
As a <role>, I want <capability>, so that <benefit>.
Parent Epic and relevant background.

## Acceptance Criteria / Definition of Done (What)
- Given <context>, when <action>, then <observable result>
- Edge cases covered
- [ ] Reviewed, tested and documented

## Scope / Details (How)
Functional notes, UI/UX or API notes, data involved (Salesforce 2GP package information), dependencies, out of scope.
```

### Task (technical detail)

```markdown
## Context (Why)
Why the technical work is needed and which Story or Epic it supports.

## Acceptance Criteria / Definition of Done (What)
- [ ] Concrete deliverable(s) (files, config, tests passing)
- [ ] How to verify them
- [ ] PR merged

## Scope / Details (How)
Step-by-step approach, files or components to change, tools and commands, dependencies, out of scope.
```

### Bug (reproduction detail)

```markdown
## Context (Why)
Impact and severity, who is affected, environment and version where it appears.

## Acceptance Criteria / Definition of Done (What)
- Expected behaviour vs actual behaviour
- [ ] Fix verified against the reproduction steps
- [ ] Regression test added
- [ ] No related regressions

## Scope / Details (How)
Steps to reproduce, logs or screenshots, suspected root cause, proposed fix, out of scope.
```

## Related conventions

- Branches are named `<type>/KYP-<n>-<slug>` and commits follow Conventional Commits. See `AGENTS.md`.
