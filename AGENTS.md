# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Know Your Package (KYP)** is an MVP that gives ISV partners up-to-date information about their Salesforce 2GP (second-generation managed package). The repo is a LIDR AI4Devs final project, so `readme.md` is the course deliverable template (Spanish) that gets filled in as the project progresses.

## State

No application code yet: `readme.md`, `prompts.md`, `prompts/`, `docs/` and agent definitions in `.claude/agents/`, plus Node tooling: commit checks (Husky, commitlint) and the agent scripts in `.claude/scripts/`, one folder per feature (test them with `npm test`). No application stack, build or lint commands are defined yet. Add them here once code lands, and don't invent them before then.

## Rules

- **Log every prompt in a per-session Markdown file in `prompts/`.** One file per session, named `YYYY-MM-DD-<slug>.md`, with each prompt appended in order as `## Prompt N` and kept verbatim. Each entry must state the tool used (e.g. Claude Code) and the model (e.g. Claude Sonnet 5.5) as `- Tool:` and `- Model:` lines above the prompt. The root `prompts.md` is the course deliverable template: curate the best prompts (max 3 per section) into it from the session files.
- **Branches and Jira:** work happens on branches named `<type>/KYP-<n>-<slug>` (e.g. `chore/KYP-1-AI-project-setup`). Create the branch before making any change.
- **Commits** follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/): `<type>(<optional scope>): <description>`, with `!` or a `BREAKING CHANGE:` footer for breaking changes. Reuse the branch type (`feat`, `fix`, `chore`, `docs`, ...) and reference the Jira key, e.g. `chore(KYP-1): add AGENTS.md project setup`. A Husky `commit-msg` hook (commitlint) rejects non-conforming messages, so run `npm install` after cloning to activate it.
- **Record important architectural and project process decisions as ADRs.** Architectural decisions shape how the product is built (e.g. the UI framework). Project process decisions shape how the project works (e.g. the Jira ticket format). `docs/adr/README.md` has more examples. The repo already shows *what* was done, so the ADR explains *why*. A decision is important if it is costly to reverse, picks between real alternatives, or changes how people or assistants work. Routine changes that follow an existing convention or ADR (bug fixes, renames, typos) need none; if unsure whether such a decision is important, write one. Create it without being asked, on the same branch as the change, after reading `docs/adr/README.md`. An agent whose definition forbids writing ADRs reports the decision instead.
- **Product decisions get no ADR.** Record them in the product documentation (`docs/product/`) with the decision, why it was taken, its trade-offs and the alternatives rejected, leaving out any of these that has nothing to record.
- **Pointers are lazy.** References to other files in `AGENTS.md` are plain paths, never `@` imports. Nothing is loaded at agent start except `AGENTS.md` itself. Read a referenced file only when the current task needs it.
- `AGENTS.md` is the source file. `CLAUDE.md` is a symlink to it, so edit `AGENTS.md`.

## Where to look (read only when the task needs it)

- Creating or editing Jira tickets (Epic, Story, Task, Bug): `docs/jira-ticket-guidelines.md`
- Commit message rules and the Husky hook: `docs/commit-conventions.md`
- Why architectural and process decisions were made: `docs/adr/`
- Product decisions and why they were made: `docs/product/`
- Writing an ADR (format, numbering, index): `docs/adr/README.md`
- Writing product documentation from a Jira task with the Product Owner agent: `docs/agents/product-owner.md`
- Reviewing product documentation with the adversarial reviewer agent: `docs/agents/product-adversarial-reviewer.md`
- Architecture principles, cited by ID (`P-01`) in designs and reviews: `docs/architecture/principles/`
- Drafting ADRs and technical designs with the AAF author agent: `docs/agents/aaf-author.md`
- The AAF reviewer panel: `docs/agents/aaf-reviewers.md`
