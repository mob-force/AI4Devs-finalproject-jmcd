# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Know Your Package (KYP)** is an MVP that gives ISV partners up-to-date information about their Salesforce 2GP (second-generation managed package). The repo is a LIDR AI4Devs final project, so `readme.md` is the course deliverable template (Spanish) that gets filled in as the project progresses.

## State

Docs-only so far: only `readme.md`, `prompts.md`, `prompts/` and `docs/` exist. No stack, build, lint or test commands are defined yet. Add them here once code lands, and don't invent them before then.

## Rules

- **Log every prompt in a per-session Markdown file in `prompts/`.** One file per session, named `YYYY-MM-DD-<slug>.md`, with each prompt appended in order as `## Prompt N` and kept verbatim. Each entry must state the tool used (e.g. Claude Code) and the model (e.g. Claude Sonnet 5.5) as `- Tool:` and `- Model:` lines above the prompt. The root `prompts.md` is the course deliverable template: curate the best prompts (max 3 per section) into it from the session files.
- **Branches and Jira:** work happens on branches named `<type>/KYP-<n>-<slug>` (e.g. `chore/KYP-1-AI-project-setup`). Create the branch before making any change.
- **Commits** follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/): `<type>(<optional scope>): <description>`, with `!` or a `BREAKING CHANGE:` footer for breaking changes. Reuse the branch type (`feat`, `fix`, `chore`, `docs`, ...) and reference the Jira key, e.g. `chore(KYP-1): add AGENTS.md project setup`.
- **Pointers are lazy.** References to other files in `AGENTS.md` are plain paths, never `@` imports. Nothing is loaded at agent start except `AGENTS.md` itself. Read a referenced file only when the current task needs it.
- `AGENTS.md` is the source file. `CLAUDE.md` is a symlink to it, so edit `AGENTS.md`.

## Where to look (read only when the task needs it)

- Creating or editing Jira tickets (Epic, Story, Task, Bug): `docs/jira-ticket-guidelines.md`
- Why decisions were made: `docs/adr/`
