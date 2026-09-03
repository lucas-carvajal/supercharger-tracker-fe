# Map

The map shows upcoming Supercharger sites on an interactive canvas. A visitor can filter by status, open a site popup, and follow a deep link from a charger page.

## Sub-features

- `map-open` opens the map from each supported entry point.
- `map-error` shows the load-error status when the backend is down.
- `map-legend` toggles status filters from the legend buttons.
- `map-popup` opens a site popup with a details link.
- `map-deeplink` focuses a site when the URL has `?charger={id}`.

## How to get to it (user POV)

- Choose `Open the map` on the home page.
- Choose `Map` in the primary nav.
- Open `/map` directly.
- Choose `Find it on the map` on a charger page, which goes to `/map?charger={id}`.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- No-backend mode covers `map-open` and `map-error`.
- Live backend is required for pins, legend filtering, popups, and deep links.

- **Nav entry.** From home, choose `Map` in the nav named `Primary`. The URL is `/map`.
- **HTTP open.** Run `.cursor/skills/verify-soonercharger/helpers/verify curl /map`. Status is `200`.
- **Error status.** In no-backend mode, a status named `Map data unavailable` appears. The message is `We're having trouble loading map data right now. Please try again later.`
- **Canvas.** With a live backend, wait until `Loading map…` is gone. The legend shows `Preliminary Planning`, `In Design`, and `Under Construction`.
- **Legend filter.** Choose `Under Construction`. That button has `aria-pressed="true"`. Pins for other statuses hide. Choose it again to clear the filter.
- **Popup.** Choose a pin. A popup heading shows the site title, a status badge, and `Click for details`. A control named `Close popup` is present. Choose the popup link. The URL becomes `/charger/{id}`.
- **Deep link.** Open `/map?charger={id}` for a known live id. The map focuses that site and the popup for that title is visible.
- **Proof.** Save a screenshot that shows the map canvas plus either the error status or the legend. Record the entry point used.

## Gotchas

- The map canvas is client-only. HTTP HTML contains `Loading map…` and does not prove pins.
- Legend buttons have no accessible name beyond the visible label. Click the label text.
- A `?charger=` deep link ignores active legend filters so the target stays visible.
- Pan and zoom persist in `sessionStorage` under `supercharger-map-viewport`. A leftover view from an earlier run can look like a failed deep link. Use a fresh browser profile when the camera is wrong.
- Closing a deep-linked popup removes `charger` from the query string.
