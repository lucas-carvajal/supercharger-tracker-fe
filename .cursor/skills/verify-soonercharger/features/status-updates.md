# Status updates

Status updates is the activity feed. A visitor sees newly added sites and recent status changes, newest first, and can load more rows.

## Sub-features

- `updates-open` opens the feed from each supported entry point.
- `updates-error` shows the load-error status when the backend is down.
- `updates-empty` shows the empty card when the API returns no rows.
- `updates-rows` lists one row per change with title, transition, and date.
- `updates-open-site` opens charger detail from a non-opened, non-removed row.
- `updates-load-more` appends the next page when more rows exist.

## How to get to it (user POV)

- Choose `Status updates` on the home page.
- Choose `Updates` in the primary nav.
- Open `/status-updates` directly.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- Fixture mode covers `updates-open` and the four fixture rows.
- `VERIFY_MODE=none` covers `updates-error`. Empty copy is not in the fixture catalog.

- **Nav entry.** From home, choose `Updates` in the nav named `Primary`. The URL is `/status-updates` and the heading is `Charger Status Updates`.
- **HTTP open.** Run `.cursor/skills/verify-soonercharger/helpers/verify curl /status-updates`. Status is `200`. The body contains `Charger Status Updates`, `Mesa Verde`, `Oak Ridge`, `Sunset Depot`, and `Cedar Lot`.
- **Error status.** With `VERIFY_MODE=none`, a status named `Updates unavailable` appears. The message is `We're having trouble loading status updates right now. Please try again later.`
- **Rows.** Newest first. `Mesa Verde` is Design to Construction. `Oak Ridge` is a new Preliminary site. `Sunset Depot` is Construction to Opened. `Cedar Lot` is Design to Removed. A `time` element shows the change date.
- **Open site.** Choose `Mesa Verde` or `Oak Ridge`. The URL becomes `/charger/mesa-verde` or `/charger/oak-ridge`.
- **Opened row.** `Sunset Depot` is an external Tesla find-us link, not `/charger/sunset-depot`.
- **Removed row.** `Cedar Lot` is a button named `Show acknowledgement for removed charger`. It does not navigate.
- **Load more.** The button is absent. The fixture catalog has only four updates, so the first page already shows every row.
- **Proof.** Save the `/status-updates` HTTP body and a screenshot that shows the heading plus the error status, the empty card, or at least one row.

## Gotchas

- Home CTA copy is `Status updates`. Nav copy is `Updates`. Both go to `/status-updates`.
- `Opened` and `Removed` rows are not charger-detail links. Do not treat that as a broken row.
- `Load more` is capped at two extra requests. A remaining total after that is expected.
- Client fetch uses `/api/superchargers/soon/recent-updates`. A first-paint error and a load-more error use different status titles.
