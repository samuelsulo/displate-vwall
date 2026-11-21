#!/usr/bin/env bash
# Test scripts/check-style.sh in a temporary git repository.
# Usage: scripts/test-check-style.sh [--keep]

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
check="$repo_root/scripts/check-style.sh"
keep=0
[[ "${1:-}" == "--keep" ]] && keep=1

work="$(mktemp -d)"
cleanup() { [[ $keep -eq 1 ]] && echo "kept: $work" || rm -rf "$work"; }
trap cleanup EXIT

failures=0
pass() { echo "ok   $1"; }
fail() { echo "FAIL $1" >&2; failures=$((failures + 1)); }
expect_pass() { local d="$1"; shift; if "$@" >/dev/null 2>&1; then pass "$d"; else fail "$d"; fi; }
expect_fail() { local d="$1"; shift; if "$@" >/dev/null 2>&1; then fail "$d"; else pass "$d"; fi; }

# The em dash is written as bytes so that this script does not contain it.
em_dash="$(printf '\342\200\224')"

expect_pass "check-style.sh is executable" test -x "$check"

cd "$work"
git init -q .
git config user.email test@example.com
git config user.name test
mkdir -p scripts
cp "$check" scripts/check-style.sh
git add -A && git commit -q -m "chore(repo): start"

echo "plain text" > notes.md
git add notes.md
expect_pass "a clean staged file passes" scripts/check-style.sh --staged
git reset -q

printf 'a %s b\n' "$em_dash" > dash.md
git add dash.md
expect_fail "an em dash in a staged file fails" scripts/check-style.sh --staged
git reset -q && rm dash.md

echo x > MyFile.txt
git add MyFile.txt
expect_fail "a new non-kebab file name fails" scripts/check-style.sh --staged
git reset -q && rm MyFile.txt

mkdir -p apps/web/src/components apps/web/src/composables live/prod/_global
echo x > apps/web/src/components/NavBar.vue
echo x > apps/web/src/composables/useTheme.ts
echo x > apps/web/src/composables/useTheme.spec.ts
echo x > apps/web/README.md
echo x > apps/web/README.template.md
mkdir -p brand/fonts && echo x > brand/fonts/Fraunces-400.ttf && echo x > brand/fonts/fraunces-OFL.txt
echo x > apps/web/vite-env.d.ts
echo x > live/prod/_global/region.hcl
echo x > .gitignore
git add -A
expect_pass "framework and doc exceptions pass" scripts/check-style.sh --staged
git commit -q -m "chore(repo): add allowed names"

echo x > LegacyName.txt && git add LegacyName.txt && git -c core.hooksPath=/dev/null commit -q -m "chore(repo): legacy"
echo y >> LegacyName.txt && git add LegacyName.txt
expect_pass "a modified legacy name passes in --staged" scripts/check-style.sh --staged
expect_fail "a legacy name is reported by --all" scripts/check-style.sh --all

mkdir -p infrastructure/catalog/modules/vendor/site/tests
echo x > infrastructure/catalog/modules/vendor/site/tests/static_site.tftest.hcl
printf 'a %s b\n' "$em_dash" > infrastructure/catalog/modules/vendor/site/README.md
git add -A
expect_pass "vendored files are skipped" scripts/check-style.sh --staged
git reset -q

expect_fail "no argument is rejected" scripts/check-style.sh

echo
if [[ $failures -eq 0 ]]; then echo "check-style: all checks passed"; else echo "check-style: $failures check(s) failed" >&2; exit 1; fi
