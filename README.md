# template-project

Starting point for every project: the files that are the same whatever the project is. A project
adds what it needs (an app, infrastructure, a brand) on top of it.

## What is in it

| Path | Purpose |
|---|---|
| `CLAUDE.md` | Short guardrails: pointer to the `repo-standard` skill plus the project's own rules |
| `.repo-standard.yml` | Profile, parts and versioning of the repo; `template` records the tag it came from |
| `cog.toml`, `lefthook.yml` | Conventional Commits, scopes, release, git hooks |
| `mise.toml` | Pinned tools and the `setup` task |
| `scripts/check-style.sh` | Em dash and kebab-case checks |
| `.github/` | Issue templates and the CI workflows (commits, secrets scan) |
| `docs/` | `adr`, `architecture`, `guides`, `runbooks`, each with a README |

## Start a project

1. Start from a tag, with a first commit that follows Conventional Commits:

   ```
   git clone --branch <tag> --depth 1 git@github.com:<owner>/template-project.git <name>
   cd <name> && rm -rf .git && git init -b main && git add -A
   git commit -m "chore(repo): start from template-project <tag>"
   ```

   Then create the GitHub repository from that folder and push, when the owner confirms
   (`gh repo create <name> --private --source . --push`). Do not use "Use this template" on GitHub:
   it makes a first commit called "Initial commit" and no tag, so `cog check` and the `Commits`
   workflow fail on the first push.
2. Fill in `CLAUDE.md` and this README, and set `profile` in `.repo-standard.yml`.
3. `mise install && mise run setup` to install the tools and the git hooks.
4. Ask for what the project needs: the `repo-standard` skill adds the parts (`apps/<name>`,
   `infrastructure/`, `brand/`) with their workflows, hooks and scopes.

## Keep it in sync

Rules and procedures live in the skills, files live here. To see what a project has drifted from,
ask for an audit with the `repo-standard` skill: it compares the repo with this template at the tag
recorded in `.repo-standard.yml`.

## Versioning

One tag `vX.Y.Z` for the whole repo, managed with cocogitto. A project records the tag it was
created from, so an update is a diff between two tags.
