# CLAUDE.md: Project Guardrails

Rules that apply to every repository live in the `repo-standard` skill. This file adds only what is
specific to this project. If a request seems to require deviating from these rules or from the
skill, stop and flag it instead of proceeding.

Must hold even if the skill is not loaded:

- Never use the em dash. Use a comma, period, colon, semicolon, parentheses or ` - `.
- Never mention the AI tool used for development, in code, comments, configuration, commit messages
  or pull requests. No `Co-Authored-By` trailers.
- Never push, tag, force-push or change repository settings without the owner's confirmation.

## What this repo is

<One or two sentences: the client or product, what it delivers. The profile is in
`.repo-standard.yml`.>

## Structure

Top-level folders are fixed and are not renamed or moved: <keep only the ones the repo has:
`apps/`, `infrastructure/`, `brand/`, `docs/`, `.github/`>.

## Project rules

<Only rules specific to this project. For a client: production lives in the client's own account,
access through a role the client can revoke, no personal client data outside the client's
infrastructure. Changes that need a manual review. For a product, its hard constraints.>
