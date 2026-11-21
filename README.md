# template-project

Starting point for every project: a way of working and the base tools. Everything else (CI
workflows, versioning and release, the structure of `docs/`, apps, infrastructure, brand) is
decided by each project according to its needs.

## What is in it

| Path | Purpose |
|---|---|
| `CLAUDE.md` | How we work and the rules for the agent, plus the project's own sections to fill in |
| `cog.toml`, `lefthook.yml` | Conventional Commits (scopes, `commit-msg` hook) and the gitleaks `pre-commit` hook |
| `mise.toml` | Pinned tools (lefthook, cocogitto, gh, gitleaks) and the `setup` task |
| `.github/ISSUE_TEMPLATE/` | Issue templates: a starting point, extend or remove them |
| `docs/` | Documentation of the project, structured as the project needs; starts with `working-method.md` |

## How we work

The developer works with the AI agent: first they plan and create the issues on GitHub, then each
issue is solved by a pull request that closes it. One issue, one pull request. The method and the
git strategy are in [`docs/working-method.md`](./docs/working-method.md); a project extends or
changes them according to its needs.

## Start a project

1. Start from a tag, with a first commit that follows Conventional Commits:

   ```
   git clone --branch <tag> --depth 1 git@github.com:<owner>/template-project.git <name>
   cd <name> && rm -rf .git && git init -b main && git add -A
   git commit -m "chore(repo): start from template-project <tag>"
   ```

   Then create the GitHub repository from that folder and push, when the owner confirms
   (`gh repo create <name> --private --source . --push`). Do not use "Use this template" on GitHub:
   it makes a first commit called "Initial commit", which is not a Conventional Commit.
2. Fill in the sections of `CLAUDE.md` and this README.
3. `mise install && mise run setup` to install the tools and the git hooks.
4. Add what the project needs: CI workflows, versioning and release, further hooks and tools.
