# Trade Journal

A personal crypto trade journal. It is a PWA: add it to the iPhone Home Screen or open it in a desktop browser. Live prices come from the public CoinGecko API.

## Develop

```sh
npm install
npm run dev     # local dev server
npm test        # unit tests (Vitest)
npm run build   # type check + production build in dist/
```

## Deploy

Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages at `https://<user>.github.io/trade-journal/`.

One-time setup: in the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## How data works

- Trades are stored only in the browser of each device (localStorage). There is no server.
- **Save backup** writes `trades.json`. On iPhone the share sheet opens: choose **Save to Files → iCloud Drive → Trades** and replace the old file. On desktop the file is downloaded; move it to `iCloud Drive/Trades/trades.json`.
- **Load backup** reads `trades.json` and merges it with the data on the device. The merge never loses trades: records are matched by id, the newest edit wins, and deletions are kept as tombstones.
- To move data to another device: Save backup on one device, Load backup on the other.

Trade data is never committed to this repository: `trades*.json` is in `.gitignore`.
