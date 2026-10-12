# 01 — Audit files and history for personal data

> **Depends on:** — · **Spec refs:** [plan §3 D3–D5, §8, §9](../plan.md),
> [history-rewrite-runbook.md](../history-rewrite-runbook.md) (done, record), [docs/README.md](../../README.md) G3 ·
> **Estimate:** 2 hours

## Goal

Prove that no personal data or secret is in the tracked files, in any commit, or in the untracked `docs/` folder that
will be committed next. The commit emails are already fixed (history rewrite done on 2026-10-12); this task checks that
nothing else needs fixing before the repo is announced.

## Context to load

- [../plan.md](../plan.md) §3, §8.
- [../history-rewrite-runbook.md](../history-rewrite-runbook.md) §3 (what was already verified) and the run log.
- `CLAUDE.md` (commit rules), `.githooks/commit-msg`.
- `.gitignore`: `trades*.json` is ignored (trade data must never be committed).
- `src/state/demo.ts`: made-up sample numbers (line 1 says so).
- `docs/`: untracked; it becomes public with its first commit.

## Scope

**In:** the checks in the steps below, and their result written in the hand-off log.

**Out:**

- The history rewrite (done; only re-run if this audit finds something, with the runbook as a guide).
- `LICENSE`, `README.md`, `SECURITY.md` (task 02). GitHub settings (task 03).

## Steps

1. **Who wrote the commits:** `git log --all --format='%an|%ae|%cn|%ce' | sort -u`. Expected: one line,
   `Stanislav Savchuk|103412957+stanislavSav@users.noreply.github.com|…` twice.
2. **Messages:** `git log --all --format='%B' | grep -inE 'co-authored-by|generated with'`. Expected: nothing.
3. **Personal data and secrets in all history** (content of every commit). Set `WORK_DOMAIN` to the domain of the
   work email by hand (do not write it into any file):

   ```sh
   git log --all -p | grep -inE "$WORK_DOMAIN|password|passwd|secret|api[_-]?key|BEGIN [A-Z ]*PRIVATE KEY|ghp_|github_pat_" | grep -v 'js-tokens'
   git log --all -p | grep -inoE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' | grep -v noreply | sort -u
   ```

   Expected: no real hit. Known false positives: `id-token: write` (workflow), `js-tokens` (lock file), the `token`
   variable in `src/ui/Sheet.tsx`, `@types/…` and `@vitejs/…` package names.
4. **Files that must never be tracked:** `git rev-list --all --objects | grep -iE 'trades.*\.json|\.env|\.pem|\.key$'`.
   Expected: nothing.
5. **Untracked docs** (committed next): `grep -rniE "$WORK_DOMAIN" docs` and a search for the work email address.
   Expected: nothing. `docs/README.md` names the work monorepo as the source of the templates; that is not personal
   data, leave it unless the owner says otherwise.
6. **Optional deeper scan:** `brew install gitleaks && gitleaks git . -v`. Expected: "no leaks found".
7. **GitHub side:** open `https://github.com/stanislavSav/trade-journal/commit/e91e3a8` (old tip) and the
   contributors graph (Insights → Contributors). Write what you see into
   [parking lot 01-old-commits-on-github](../parking-lot/01-old-commits-on-github.md).
8. Write the audit result in the hand-off log (commands, hits, decision).
9. If anything is found: stop, add a parking-lot item, and do not start task 02 until the owner decides (a second
   rewrite may need `git filter-repo --replace-text` or `--path`).

## Acceptance criteria

- [x] The hand-off log lists the audit commands and their result.
- [x] No secret or personal data in tracked files, history, or `docs/` (or each finding has a parking-lot item and a
      decision).
- [x] `git log --all --format='%ae%n%ce' | sort -u` prints only `103412957+stanislavSav@users.noreply.github.com`.
- [x] No commit message has a co-author trailer.
- [x] `git config --local user.email` is the noreply address and `git config core.hooksPath` is `.githooks`.
- [x] The parking-lot item about old commits on GitHub has today's observation.

## Verification

```sh
git log --all --format='%h %an <%ae> | %cn <%ce> | %s'
git log --all --format='%ae%n%ce' | sort -u
git config --local user.email; git config core.hooksPath
npm test && npm run typecheck && npm run build
```

No code changes are expected; the npm commands only prove the tree is healthy.

## Hand-off log

**2026-10-12 — history rewrite done before this task (owner session).** Bundle of all refs to the session scratchpad;
`git filter-branch` set author and committer to `Stanislav Savchuk <103412957+stanislavSav@users.noreply.github.com>`
and removed co-author lines from messages; repo-local identity set; `git push --force-with-lease=main:e91e3a8`. New
hashes `f961d0f`, `b24f49c`, then `d540f39` (commit rules: `CLAUDE.md`, `.claude/settings.json`,
`.githooks/commit-msg`). Pages deploy green. Details: [runbook](../history-rewrite-runbook.md).

**2026-10-12 — done.** Authors: one identity (noreply). Messages: no co-author or tool lines. History grep: no secrets; the only email is an npm author in package-lock.json. No trades/.env/key files in any commit. docs/: no work email or domain; the partner folder is excluded via .git/info/exclude. gitleaks not installed (skipped). GitHub: old commit e91e3a8 still opens by hash with the old email; Contributors shows only stanislavSav.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | —          | —            |
