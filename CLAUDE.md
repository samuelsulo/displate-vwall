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

<One or two sentences: the client or product, what it delivers.>

## Structure

<The top-level folders of the repo and what each holds.>

## Project rules

<Only rules specific to this project: hard constraints, changes that need a manual review, how it is
versioned and released, which CI workflows it runs.>
