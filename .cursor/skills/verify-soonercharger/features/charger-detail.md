# Charger detail

Charger detail is one upcoming site. A visitor sees the title, status, timeline, map jump, and Tesla source link, or an unavailable page when the site cannot load.

## Sub-features

- `charger-open` opens a site from a list card, map popup, or updates row.
- `charger-error` shows `Charger data unavailable` when the backend is down.
- `charger-not-found` returns the app not-found page for an unknown id when the API answers 404.
- `charger-source` exposes `View on Tesla.com`.
- `charger-map-jump` goes to `/map?charger={id}` from `Find it on the map`.
- `charger-back` returns through `Back to all sites`.

## How to get to it (user POV)

- Choose a card on `/list`.
- Choose `Click for details` on a map popup.
- Choose a non-opened, non-removed row on `/status-updates`.
- Open `/charger/{id}` directly.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- No-backend mode covers `charger-error` for any id.
- Live backend is required for a real site, the Tesla link, and the map jump.

- **Error page.** In no-backend mode, run `.cursor/skills/verify-soonercharger/helpers/verify curl /charger/any-id`. Status is `200`. The body contains `Charger data unavailable` and `We couldn't load this charger overview right now.`
- **Browser error.** Open `{origin}/charger/any-id` without a backend. The heading is `Charger data unavailable`.
- **Open from list.** With a live backend, choose a list card. The URL is `/charger/{id}`. The heading matches the card title. A status badge is visible. `Buildout progress` and `Find it on the map` are visible.
- **Breadcrumb.** A nav named `Breadcrumb` contains `Back to all sites`.
- **Source link.** Choose `View on Tesla.com`. A new tab opens the charger's `tesla_url`.
- **Map jump.** Choose the map region under `Find it on the map`. The URL becomes `/map?charger={id}`.
- **Back.** From a list-origin visit, choose `Back to all sites`. The browser returns to `/list` when history can go back. Otherwise the link goes to `/list`.
- **Not found.** With a live backend, open `/charger/does-not-exist`. The app not-found page appears. Do not treat that as `Charger data unavailable`.
- **Proof.** Save the HTTP body for the id you opened and a screenshot of the heading. Record the entry point. For the error path, the heading must be `Charger data unavailable`.

## Gotchas

- A backend miss is not a 404. 404 is only `ApiError` status 404. Other failures render `Charger data unavailable` with HTTP 200.
- `Back to all sites` calls `router.back()` when the referrer is same-origin and history has more than one entry. Opening the URL cold always goes to `/list`.
- Charger pages are not linked from home. List, map, updates, or a known id are the entry points.
- Title metadata uses city and region when present, not always the on-page heading. Assert the visible `h1`, not the document title, for the site name.
