# Trade Journal

A private crypto trade journal that runs in your browser. Group your buys and sells into bags, see the average cost and
the realized and unrealized profit or loss of each one, with live prices from CoinGecko. Open it at
https://stanislavsav.github.io/trade-journal/.

<!-- Screenshots: list, bag, add trade. Sample data only. -->

## Features

- Bags: one trade idea for one coin, with its own average cost. A coin can have several bags.
- Open and closed bags, realized and unrealized P/L.
- Live prices from CoinGecko; the last known prices are kept for offline use.
- Backups that merge and never lose trades.
- Works offline after the first visit.
- Installs to the iPhone Home Screen like an app.
- English and Ukrainian. The app follows the language of the device; change it in **Settings** (the gear button next
  to Backup).

## Privacy

There is no server, no account and no tracking: your trades stay in this browser on this device. The only network calls
go to CoinGecko for prices and coin search. Your backup file is plain JSON, so keep it private. Details:
[SECURITY.md](SECURITY.md).

## Install on iPhone

Open the live link in Safari → tap **Share** → **Add to Home Screen** → **Add**. On a desktop, the app works in a
browser tab, or use the browser's install button if it shows one.

## Try it

Open the live app. Your data stays on your device. Two safe ways to test it:

- **Try the demo:** https://stanislavsav.github.io/trade-journal/?demo opens the app with sample data: three accounts
  with open and closed bags. Nothing is saved and your own data is not touched. **Exit demo** in the banner returns to
  your app. Reloading the page starts the demo again.
- **Test backups with the sample file:** download https://stanislavsav.github.io/trade-journal/sample-backup.json (or
  open [public/sample-backup.json](public/sample-backup.json) on GitHub → **Download raw file**), then open
  **Backup → Load backup** and pick the file.

**Loading the sample file merges it into the data in that browser.** Use a private window, a test device, or the demo
link. To remove the sample data again: **Settings → Accounts**, remove `Demo`, `Demo Family` and `Demo Swing`.

## How data works

- Trades are stored only in the browser of each device (localStorage). There is no server.
- **Save backup** writes `trades.json`. On iPhone the share sheet opens: for example, choose **Save to Files → iCloud
  Drive** and replace the old file. On a desktop the file is downloaded.
- **Load backup** reads `trades.json` and merges it with the data on the device. The merge never loses trades: records
  are matched by id, the newest edit wins, and deletions are kept as tombstones.
- To move data to another device: Save backup on one device, Load backup on the other.

Trade data is never committed to this repository: `trades*.json` is in `.gitignore`.

## Develop

```sh
npm install
npm run dev        # local dev server; add ?demo to the URL for sample data
npm test           # unit tests (Vitest)
npm run typecheck  # TypeScript check
npm run build      # type check + production build in dist/
```

The sample backup file is generated from `src/state/demoData.ts`. After you change the demo data, run
`npm test -- -u` to write the new `public/sample-backup.json`.

After cloning, run `git config core.hooksPath .githooks` once. Commit rules: [CLAUDE.md](CLAUDE.md). Plans and task
briefs: [docs/](docs/README.md).

## Deploy

Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages at
https://stanislavsav.github.io/trade-journal/. For a fork, the address is `https://<your-user>.github.io/trade-journal/`.

One-time setup for a fork: in the repository settings, set **Pages → Build and deployment → Source** to **GitHub
Actions**.

## Licence

MIT, see [LICENSE](LICENSE).

The storage logos in `src/storage-tags/icons/` are not covered by the MIT licence. Their sources and licences are in
[NOTICE.md](src/storage-tags/icons/NOTICE.md). Logos are trademarks of their owners. They are used only to name the
service where the user keeps coins. No endorsement is implied.
