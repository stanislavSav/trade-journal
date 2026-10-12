# Trade Journal

Personal crypto trade journal PWA (React + Vite + TypeScript). No server: data lives in the browser, backups are a JSON
file. See [README.md](README.md) for commands and [docs/README.md](docs/README.md) for plans, tasks and the roadmap.

## Commits

- The owner is the only author. Never add `Co-Authored-By` trailers, "Generated with …" lines, or mentions of Claude or
  Anthropic to commit messages, PR titles or PR descriptions. `.claude/settings.json` turns attribution off; the
  `.githooks/commit-msg` hook rejects such messages.
- Commit identity is the repo-local git config: `Stanislav Savchuk <103412957+stanislavSav@users.noreply.github.com>`.
  Never commit with a work email.
- After cloning, enable the hook once: `git config core.hooksPath .githooks`.
- Message style: imperative summary line, then a short bullet list of what changed and why.
- Never commit trade data (`trades*.json` is ignored).
