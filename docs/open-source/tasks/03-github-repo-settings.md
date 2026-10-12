# 03 — GitHub repo settings

> **Depends on:** 02 · **Spec refs:** [plan §3 D1 D6 and defaults, §5](../plan.md) · **Estimate:** 1 hour

## Goal

The repo page on GitHub tells a stranger what the app is and links to the live app; strangers can report a security
problem privately.

## Context to load

- [../plan.md](../plan.md) §3 (description and topics are in "Defaults decided without a question") and §5.
- `SECURITY.md` from task 02 (it tells people to use "Report a vulnerability").

## Scope

**In:** description, homepage, topics, private vulnerability reporting, secret scanning, wiki/projects off.

**Out:** branch protection, rulesets, Discussions (not needed for a one-person repo; add when someone contributes).

## Steps

All commands are for the **owner**; an agent only prepares them. Check the account first: `gh auth status` must show
`stanislavSav` as active (else `gh auth switch --user stanislavSav`).

1. Look at today's settings:

   ```sh
   gh repo view stanislavSav/trade-journal --json description,homepageUrl,repositoryTopics,hasWikiEnabled,hasProjectsEnabled
   ```

2. Description, homepage, topics:

   ```sh
   gh repo edit stanislavSav/trade-journal \
     --description "Private crypto trade journal PWA. Average cost per bag, live CoinGecko prices. Data stays in your browser." \
     --homepage "https://stanislavsav.github.io/trade-journal/" \
     --add-topic pwa --add-topic crypto --add-topic trade-journal --add-topic portfolio-tracker \
     --add-topic react --add-topic typescript --add-topic vite --add-topic offline-first \
     --add-topic localstorage --add-topic coingecko
   ```

3. Wiki and projects off (the docs live in `docs/`):

   ```sh
   gh repo edit stanislavSav/trade-journal --enable-wiki=false --enable-projects=false
   ```

4. Private vulnerability reporting on (`SECURITY.md` points to it):

   ```sh
   gh api -X PUT repos/stanislavSav/trade-journal/private-vulnerability-reporting
   gh api repos/stanislavSav/trade-journal/private-vulnerability-reporting --jq .enabled   # expected: true
   ```

   If the API call fails: github.com → repo → **Settings → Code security → Private vulnerability reporting → Enable**.

5. Secret scanning and push protection (free for public repos):

   ```sh
   gh repo edit stanislavSav/trade-journal --enable-secret-scanning --enable-secret-scanning-push-protection
   ```

   If it fails, turn both on in **Settings → Code security**.

6. Write the final `gh repo view …` output (step 1 command) in the hand-off log.

## Acceptance criteria

- [ ] `gh repo view stanislavSav/trade-journal --json description,homepageUrl,repositoryTopics` shows the description,
      `https://stanislavsav.github.io/trade-journal/` and the 10 topics.
- [ ] The repo page sidebar shows the description, the live link, the topics, "MIT license" and "Security policy".
- [ ] `gh api repos/stanislavSav/trade-journal/private-vulnerability-reporting --jq .enabled` prints `true`; the
      Security tab shows "Report a vulnerability".
- [ ] Secret scanning and push protection are on (Settings → Code security).
- [ ] Wiki and Projects tabs are gone.

## Verification

```sh
gh repo view stanislavSav/trade-journal --json description,homepageUrl,repositoryTopics,hasWikiEnabled,hasProjectsEnabled
gh api repos/stanislavSav/trade-journal/private-vulnerability-reporting --jq .enabled
```

No code changes, so `npm test`, `npm run typecheck` and `npm run build` are not needed for this task.

Manual: open `github.com/stanislavSav/trade-journal` in a private browser window (logged out) and read it as a
stranger. Click one topic (e.g. `trade-journal`); the topic page lists the repo.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
