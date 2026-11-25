# ADR 0005: Agents pass requests to their scripts through a file

- **Status:** Proposed
- **Date:** 2026-11-26
- **Ticket:** KYP-13

## Context

Both agents hand content to a script that acts on Jira's or GitHub's side of the workflow: the reviewer its report, the Product Owner its requests. They first sent it in the shell command, through a quoted heredoc (ADR 0003). A live run showed that Claude Code checks the whole command before running it and refuses it: a JSON request was rejected as "Contains brace with quote character (expansion obfuscation)", and a long report as "Parser aborted (timeout, resource limit, or over-length)". Allow rules do not override these checks, so the steps failed.

## Decision

1. Each agent writes its content to one file in `.agent-tmp/`, which Git ignores: `review-report.md` for the reviewer and `po-request.json` for the Product Owner.
2. It then runs one fixed command with no arguments. The script reads the file and removes it.
3. Each agent's hook allows exactly that command and, for files outside its own work, exactly that file. The reviewer therefore gets the `Write` tool.

## Consequences

- Positive: length and content no longer affect whether the command runs, and nothing from a document or the web reaches the shell.
- Positive: the hooks compare an exact command instead of parsing a heredoc.
- Negative: the reviewer has a file-writing tool. Only the hook limits it to the report file, and Claude Code skips the hook in a folder that is not trusted, where the permission settings are the only limit.
- Negative: each step takes two calls, and the person may be asked to allow both.

## Alternatives considered

- **Keep the heredoc and rely on approving each prompt:** fails in non-interactive runs, and approving a very long command is not a real check.
- **Another heredoc format without braces:** reports and pull request bodies are free text, so they can still be rejected or exceed the length limit.
- **A hook that publishes the reviewer's final answer:** needs no file tool, but the agent would not learn whether publishing worked within the same turn, and it would not help the Product Owner.
