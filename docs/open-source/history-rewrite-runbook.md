# Rewrite commit emails to the GitHub noreply address — runbook

> **Status:** Done · **Environment:** prod (`github.com/stanislavSav/trade-journal`, branch `main`) ·
> **Owner:** @stanislavSav · **Last run:** 2026-10-12

Spec: [plan.md](plan.md) D3–D5, G3 in [docs/README.md](../README.md). Task: [tasks/01](tasks/01-audit-personal-data.md).

This runbook is now a **record** of what was done on 2026-10-12, plus how to check it and how to roll it back. Do not
run it again: history is already rewritten. Keep it for the next time a rewrite is needed (for example, if the audit
in task 01 finds something in file content).

## 0. Before you start

What the run did, and why in this order:

1. **Bundle backup first** of all refs. It is the only rollback.
2. **Rewrite** author and committer of every commit, and clean the messages, in one pass.
3. **Set the repo-local identity**, so new commits use the noreply address.
4. **Force-push with a lease** on the old tip, so the push fails if GitHub had a commit not seen locally.

State before the run: `main` had 2 commits (old tip `e91e3a8`), no tags, no other branches. Both commits had author and
committer = the work GitHub handle + the work email, and their messages had co-author trailer lines. This record
never spells the work email out, because the docs are public.

Tool: `git filter-branch` (built into git). `git-filter-repo` was not installed (`which git-filter-repo` → not found),
and for 2 commits `filter-branch` is fast and safe enough.

## 1. Preconditions

- [x] `main` up to date with `origin/main` (old tip `e91e3a8`), nothing to push.
- [x] Clean working tree except the untracked `docs/` folder (not touched by the rewrite).
- [x] No forks, no pull requests, no other clone with unpushed work.
- [x] `gh` logged in as `stanislavSav` (used as the git credential helper for the push).
- [x] New identity known: `Stanislav Savchuk <103412957+stanislavSav@users.noreply.github.com>` (id from
      `gh api users/stanislavSav --jq .id` → `103412957`).

## 2. Steps

The commands below show the shape of what was run. The exact shell session was not saved; a future run should use
the same steps.

### 2.1 Bundle backup of all refs

```sh
git bundle create <scratchpad>/trade-journal-before-rewrite.bundle --all
git bundle verify <scratchpad>/trade-journal-before-rewrite.bundle      # "… is okay"
```

The bundle was written to the agent session's scratchpad:
`/private/tmp/claude-501/-Users-stan-Personal-trade-journal/fcf816fb-0baf-4753-9114-4714a04dedc7/scratchpad/trade-journal-before-rewrite.bundle`.
This is a temporary folder. If a rollback may be needed, copy it somewhere safe (not into the repo); see §5.

### 2.2 Rewrite author, committer and messages

```sh
NEW_NAME="Stanislav Savchuk"
NEW_EMAIL="103412957+stanislavSav@users.noreply.github.com"
git filter-branch -f \
  --env-filter "
    export GIT_AUTHOR_NAME='$NEW_NAME' GIT_AUTHOR_EMAIL='$NEW_EMAIL'
    export GIT_COMMITTER_NAME='$NEW_NAME' GIT_COMMITTER_EMAIL='$NEW_EMAIL'" \
  --msg-filter "grep -v -i -E '^(co-authored-by:|.*generated with)'" \
  -- --all
```

- `--env-filter` sets author and committer on every commit; the original dates stay.
- `--msg-filter` removes the co-author trailer lines (and similar attribution lines) from the messages.
- After the check in 2.4, the backup refs that `filter-branch` leaves under `refs/original/` can be deleted:
  `git update-ref -d refs/original/refs/heads/main`.

### 2.3 Repo-local identity for future commits

```sh
git config user.name  "Stanislav Savchuk"
git config user.email "103412957+stanislavSav@users.noreply.github.com"
```

The global git config stays the work identity (other repos on this Mac need it).

### 2.4 Check locally (before the push)

```sh
git log --format='%h %an <%ae> | %cn <%ce> | %s'     # only the noreply address
git diff e91e3a8 HEAD --stat                         # empty: same files, only metadata changed
```

### 2.5 Force-push — DESTRUCTIVE

```sh
git -c credential.helper='!gh auth git-credential' push --force-with-lease=main:e91e3a8 origin main
```

git had no credential helper on this Mac, so the push used `gh` as a one-time helper (`-c`, nothing saved in the
config). The lease on `e91e3a8` makes the push fail if GitHub's `main` had moved.

Result: the old commits were replaced by `f961d0f` (Trade journal PWA: …) and `b24f49c` (Swipe back from the bag
screen).

### 2.6 Commit rules commit (same session)

Right after the rewrite, a third commit `d540f39` "Add commit rules: single author, no AI attribution" added:

- `CLAUDE.md` (repo root): the commit rules (one author, repo-local identity, message style, enable the hook).
- `.claude/settings.json`: attribution in commits and PRs turned off for coding agents.
- `.githooks/commit-msg`: rejects messages with co-author trailers or tool mentions. Enable once per clone:
  `git config core.hooksPath .githooks` (enabled in this clone).

### 2.7 Pages redeploy

The push to `main` triggered `.github/workflows/deploy.yml`. Run for `d540f39`: **success** (2026-10-12, 44 s).

## 3. Verification

Checked on 2026-10-12:

- [x] `git log --format='%an <%ae> | %cn <%ce>'` shows only
      `Stanislav Savchuk <103412957+stanislavSav@users.noreply.github.com>` for `d540f39`, `b24f49c`, `f961d0f`.
- [x] GitHub agrees: `gh api repos/stanislavSav/trade-journal/commits --jq '.[] | .sha[0:7] + " " + .commit.author.email'`
      prints only the noreply address.
- [x] `git config --local user.email` → `103412957+stanislavSav@users.noreply.github.com`; `core.hooksPath` →
      `.githooks`.
- [x] The newest `deploy.yml` run is green.
- [ ] Open `https://github.com/stanislavSav/trade-journal/commit/e91e3a8`. If it still opens, see
      [parking lot](parking-lot/01-old-commits-on-github.md).
- [ ] The contributors graph on GitHub shows only `stanislavSav` (it can take some time to refresh).

To check again at any time:

```sh
git log --all --format='%ae%n%ce' | sort -u           # only the noreply address
WORK_DOMAIN=<work email domain>; git log --all -p | grep -ci "$WORK_DOMAIN"   # 0
```

## 4. Rollback / recovery

Rollback brings the work email back on GitHub. Only do it if something is really broken.

| Situation                              | What to do                                                                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Need the old history locally           | `git fetch <bundle> main:before-rewrite` (the old tip is `e91e3a8`).                                                                                                                              |
| Need the old history on GitHub         | `git fetch <bundle> main:before-rewrite`, then `git push --force-with-lease=main:$(git rev-parse origin/main) origin before-rewrite:main` (**destructive**; also drops `d540f39` — cherry-pick it first if needed). |
| Bundle is gone (scratchpad cleaned)    | No rollback is possible, and none is needed: the rewrite changed only metadata (`git diff e91e3a8 HEAD` was empty).                                                                              |
| Another clone still has the old history | `git fetch origin && git reset --hard origin/main` (only when it has no local work), or re-clone.                                                                                                |
| Pages deploy fails later               | Not caused by the rewrite. Re-run: `gh workflow run deploy.yml -R stanislavSav/trade-journal`.                                                                                                   |

## 5. After the window

- [ ] Decide about the bundle: copy it to a safe place for a month, or delete it. It still holds the work email. The
      scratchpad copy will disappear by itself.
- [ ] Other clones (other Macs): re-clone, then `git config core.hooksPath .githooks` and the repo-local identity.
- [ ] GitHub cache and contributors graph: [parking lot](parking-lot/01-old-commits-on-github.md).
- [x] Run log filled; **Last run** set.

## Run log

| Date       | Environment             | Who               | Result  | Notes                                                                                                                                                                             |
| ---------- | ----------------------- | ----------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-12 | prod (GitHub, `main`)   | Stanislav Savchuk | Success | Bundle of all refs to the session scratchpad; `filter-branch` env + msg filter; repo-local identity; `--force-with-lease=main:e91e3a8`. New: `f961d0f`, `b24f49c`; then `d540f39` (commit rules). Pages deploy green. |
