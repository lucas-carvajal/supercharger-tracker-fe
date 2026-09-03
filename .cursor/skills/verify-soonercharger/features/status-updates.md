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
- No-backend mode covers `updates-open` and `updates-error`.
- Live backend is required for rows, empty state, and load more.

- **Nav entry.** From home, choose `Updates` in the nav named `Primary`. The URL is `/status-updates` and the heading is `Charger Status Updates`.
- **HTTP open.** Run `.cursor/skills/verify-soonercharger/helpers/verify curl /status-updates`. Status is `200`. The body contains `Charger Status Updates`.
- **Error status.** In no-backend mode, a status named `Updates unavailable` appears. The message is `We're having trouble loading status updates right now. Please try again later.`
- **Empty.** With a live backend that returns no items, the card reads `No recent updates yet. Check back soon, or browse upcoming sites on the list or map.`
- **Rows.** Each row heading is the site title or `Unnamed location`. A group labeled with the transition text sits under the title. A `time` element shows the change date.
- **Open site.** Choose a row that is not `Opened` and not `Removed`. The URL becomes `/charger/{id}`.
- **Opened row.** An `Opened` row is an external Tesla find-us link, not `/charger/{id}`.
- **Removed row.** A `Removed` row is a button named `Show acknowledgement for removed charger`. It does not navigate.
- **Load more.** If `Load more` is visible, choose it. The button reads `Loading…` then more rows appear. At most two extra batches exist. A later failure shows `Could not load more updates`.
- **Proof.** Save the `/status-updates` HTTP body and a screenshot that shows the heading plus the error status, the empty card, or at least one row.

## Gotchas

- Home CTA copy is `Status updates`. Nav copy is `Updates`. Both go to `/status-updates`.
- `Opened` and `Removed` rows are not charger-detail links. Do not treat that as a broken row.
- `Load more` is capped at two extra requests. A remaining total after that is expected.
- Client fetch uses `/api/superchargers/soon/recent-updates`. A first-paint error and a load-more error use different status titles.
