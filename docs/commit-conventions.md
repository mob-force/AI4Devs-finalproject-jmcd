# Commit conventions

Every commit message must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/): `<type>(<optional scope>): <description>`. Reuse the branch type and reference the Jira key, e.g. `chore(KYP-5): add husky`.

## Enforcement

A Husky `commit-msg` hook runs [commitlint](https://commitlint.js.org/) (`@commitlint/config-conventional`, see `commitlint.config.js`) on every commit. A non-conforming message is rejected and no commit is created. The hook applies equally to people and AI assistants.

## Setup

Run `npm install` once after cloning. The `prepare` script runs `husky`, which points Git at `.husky/`. Without this step the hook is not active.

## Try it

```sh
git commit -m "added stuff"            # rejected: type and subject may not be empty
git commit -m "chore(KYP-5): add stuff" # accepted
```

Allowed types (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`, `style`, `revert`) come from `@commitlint/config-conventional`.
