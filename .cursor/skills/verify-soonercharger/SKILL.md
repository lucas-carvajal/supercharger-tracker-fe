---
name: verify-soonercharger
description: "Drive the Soonercharger Next.js web app the way a user does and capture proof. Use when verifying UI, routing, public pages, admin login, or HTTP routes after a change."
---

# Verify Soonercharger

Soonercharger is the Supercharger Tracker frontend. The user-facing surface is a Next.js 16 App Router website. Public pages live under `app/(public)`. Admin lives under `/admin` and is not linked from public nav. Machine-readable extras are `/api/health`, `/api/superchargers/soon`, `/robots.txt`, and `/sitemap.xml`.

This skill is for the next agent. Read `features/README.md` before you drive. Use the matching feature file as the recipe. Do not invent a shorter path.

## Launch

This checkout can run only one `next dev` at a time. Next.js 16 takes a lock under `.next/dev`. A second `next dev` on the same worktree fails. Do not drive `localhost:3000` or any other server you did not start.

```bash
export VERIFY_RUN_ID=your-run-id
.cursor/skills/verify-soonercharger/helpers/verify launch
```

Ready means `GET {origin}/api/health` returns `{"status":"ok"}`. The helper prints `ready http://127.0.0.1:4310 pid=...`. Default bind is `127.0.0.1:4310`. Override with `VERIFY_PORT` and `VERIFY_HOST`.

Two modes:

- No backend, the default. Leave `VERIFY_BACKEND_URL` unset. Home still renders. List, map, status updates, and charger detail show their load-error copy. `/sitemap.xml` still returns the static routes.
- Live backend. Set `VERIFY_BACKEND_URL` to a reachable Rust API before launch. Required for cards, map pins, charger titles, and update rows.

Launch writes state under `/tmp/soonercharger-verify-$VERIFY_RUN_ID`. Evidence goes to `/tmp/soonercharger-verify-evidence/$VERIFY_RUN_ID`. Cleanup deletes only the state directory.

If launch says another `next dev` holds the checkout, stop. Do not kill a process you did not start.

## Doctor

Run this first whenever anything looks off.

```bash
.cursor/skills/verify-soonercharger/helpers/verify doctor
```

Doctor is read-only. It checks that the saved pid is alive, that pid owns `VERIFY_PORT`, that `/api/health` is `{"status":"ok"}`, and that `GET /` contains `Soonercharger`. If any check fails, stop driving. Relaunch or cleanup. Do not fall back to another origin.

## Drive

Harness is `helpers/verify` plus a browser. There is no Playwright project here.

HTTP first for routes and HTML. Browser only for clicks, filters, map, and forms.

```bash
.cursor/skills/verify-soonercharger/helpers/verify curl /
.cursor/skills/verify-soonercharger/helpers/verify curl /list
.cursor/skills/verify-soonercharger/helpers/verify curl /robots.txt
```

`curl` writes `{evidence}/{path}.status` and `{evidence}/{path}.body`, then prints the status line and the body path. It does not print the body. Path must start with `/`.

Stable handles from this repo:

- Home heading `Soonercharger`
- Home links `Browse the list`, `Open the map`, `Status updates`
- Header brand `aria-label="Soonercharger home"`
- Primary nav `aria-label="Primary"` with `List`, `Map`, `Updates`
- List heading `All upcoming Superchargers`
- List error status `Supercharger data unavailable`
- List filters `All Statuses`, `Preliminary Planning`, `In Design`, `Under Construction`, `All Regions`
- List button `Show more`
- Map error status `Map data unavailable`
- Map loading text `Loading map…`
- Map legend buttons `Preliminary Planning`, `In Design`, `Under Construction` with `aria-pressed`
- Updates heading `Charger Status Updates`
- Updates error status `Updates unavailable`
- Updates empty copy `No recent updates yet`
- Updates button `Load more`
- Charger error heading `Charger data unavailable`
- Charger 404 heading `Charger not found` with `Go back` and `Browse the map`
- Charger breadcrumb `aria-label="Breadcrumb"` and `Back to all sites`
- Charger source link `View on Tesla.com`
- Map popup `Close popup`, `Zoom in`, `Zoom out`
- Admin login heading `Sign in to admin`
- Admin fields `username`, `password`, button `Sign in`
- Admin errors `Invalid username or password.` and `Sign in is temporarily unavailable.`

Prefer those strings and ARIA names. Do not use layout coordinates.

Open `/admin` only when the feature file asks for it. Never add an admin link to public nav. The `admin_session` cookie is host and path, not port. Two `localhost` ports share it. Use a fresh browser profile for admin, or stay on `127.0.0.1` and do not also drive `localhost`.

## Evidence

Proof lives in `/tmp/soonercharger-verify-evidence/$VERIFY_RUN_ID`. Cleanup must not delete that directory.

Standards:

- Drive the real user path. Do not call Rust directly. Do not use test-only endpoints. `/api/superchargers/soon` is the list page's own fetch. That is a user path.
- Capture the action and the resulting state. A final screenshot alone is not proof.
- HTTP proof is the command, status code, and body. Keep both files the helper writes.
- Browser proof is the click or fill plus the visible result. Save an ARIA snapshot or the HTML, and a screenshot that shows the Soonercharger heading or the feature heading.
- Live-backend mutations on `/admin` write to the shared Rust API. Do not run import unless the backend is disposable. Login and failed login do not write charger data.
- Record the feature id and the entry point on every artifact.

## Cleanup

```bash
.cursor/skills/verify-soonercharger/helpers/verify cleanup
```

Cleanup kills only the pid tree this run started, then deletes `/tmp/soonercharger-verify-$VERIFY_RUN_ID`. It leaves `/tmp/soonercharger-verify-evidence/$VERIFY_RUN_ID` in place. After cleanup, confirm the evidence files still exist.

Do not kill by process name. Do not kill an unrelated `next dev`.

## Helpers

`helpers/verify` is executable. Invoke it from the repo root.

```bash
export VERIFY_RUN_ID=your-run-id
.cursor/skills/verify-soonercharger/helpers/verify launch
.cursor/skills/verify-soonercharger/helpers/verify doctor
.cursor/skills/verify-soonercharger/helpers/verify origin
.cursor/skills/verify-soonercharger/helpers/verify curl /api/health
.cursor/skills/verify-soonercharger/helpers/verify cleanup
```

`helpers/verify` with no args prints usage.
