# CLAUDE.md: Project Guardrails

If a request seems to require deviating from these rules, stop and flag it instead of proceeding.

## How we work

Plan with the developer, turn the plan into issues, solve each issue with its own pull request that
closes it, and commit with Conventional Commits. The method and the git strategy are in
[`docs/working-method.md`](./docs/working-method.md). It is a preference: the project extends or
changes it according to its needs.

## Rules

- Write code, comments, configuration, commit messages and Markdown in English. Content delivered in
  another language (site copy, i18n files) is the exception.
- Never use the em dash. Use a comma, period, colon, semicolon, parentheses or ` - `.
- Never mention the AI tool used for development, in code, comments, configuration, commit messages
  or pull requests. No `Co-Authored-By` trailers.
- Never push, tag, force-push or change repository settings without the owner's confirmation.
- Never put credentials in the repository or in CI.
- Document a concept once, in the file it belongs to, and link to it from everywhere else. Update the
  docs in the same change that makes them outdated.
- Prefer kebab-case for file and folder names. Where the language or framework has its own
  convention (PascalCase components, snake_case in Python, `useX` composables), follow that one.
- Put a `README.md` in every structural folder.

## What this repo is

Displate virtual wall: a local-only Vue app to search Displate posters, pick a size (M, L, XL) and arrange them on a virtual wall at real scale. Unofficial, not affiliated with Displate.

## Structure

- `web/`: the Vue app (see [`web/README.md`](./web/README.md)).
- `docs/`: project documentation.
- `.github/`: issue templates and CI workflows.

## Project rules

- The app runs locally only. The Displate API is reached through the Vite proxy, which must forward
  only the search path and keep its rate limit; changes to the proxy need a manual review.
- Commit scope for the app is `web`.
- CI: `commits.yml` (Conventional Commits), `secrets-scan.yml` (gitleaks), `web-ci.yml` (lint, format,
  type check, test, build for `web/`).
