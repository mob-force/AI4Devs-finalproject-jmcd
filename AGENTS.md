# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Know Your Package (KYP)** is an MVP that gives ISV partners up-to-date information about their Salesforce 2GP (second-generation managed package). The repo is a LIDR AI4Devs final project, so `readme.md` is the course deliverable template (Spanish) that gets filled in as the project progresses.

## State

Docs-only so far: only `readme.md` and `prompts.md` exist. No stack, build, lint or test commands are defined yet. Add them here once code lands, and don't invent them before then.

## Rules

- **Log every prompt in `prompts.md`.** Add it under the matching section (and Prompt 1/2/3 slot) of that file. Keep the prompt text as written. The course asks for at most 3 per section, so pick the most relevant.
- **Branches and Jira:** work happens on branches named `<type>/KYP-<n>-<slug>` (e.g. `chore/KYP-1-AI-project-setup`). Create the branch before making any change.
- **Commits** follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/): `<type>(<optional scope>): <description>`, with `!` or a `BREAKING CHANGE:` footer for breaking changes. Reuse the branch type (`feat`, `fix`, `chore`, `docs`, ...) and reference the Jira key, e.g. `chore(KYP-1): add AGENTS.md project setup`.
- `AGENTS.md` is the source file. `CLAUDE.md` is a symlink to it, so edit `AGENTS.md`.
