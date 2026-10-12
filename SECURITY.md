# Security policy

## Supported version

Only the latest `main`. The live app at https://stanislavsav.github.io/trade-journal/ updates itself.

## How to report a problem

Use GitHub → **Security** tab → **Report a vulnerability**. The report is private. Please do not open a public issue
for a security problem.

## Threat model

- There is no server and no user account. Your journal lives only in this browser's `localStorage` on this device.
  Anyone who can use your unlocked device and browser profile can read it.
- The only network calls go to `api.coingecko.com` (prices and coin search). CoinGecko sees your IP address and which
  coins you look up. It never sees your quantities or totals.
- The backup file `trades.json` is plain JSON, not encrypted, with all your trades. Protect it like a bank statement:
  keep it in private storage and do not post it.
- **Load backup** only reads a file you pick. A broken or foreign file is rejected, never run.

## Scope

**In scope:** anything that sends journal data off the device, or makes the app run foreign code.

**Out of scope:** attacks that need your unlocked device, and the security of CoinGecko itself.
