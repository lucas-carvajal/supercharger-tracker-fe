# Upcoming list

The list lets a visitor browse upcoming Supercharger sites, filter by status and region, load more cards, and open a site.

## Sub-features

- `list-open` opens the upcoming list from each supported entry point.
- `list-error` shows the load-error status when the backend is down.
- `list-cards` renders one card per site with title, status badge, and a link to `/charger/{id}`.
- `list-filter-status` replaces the grid from the status select.
- `list-filter-region` replaces the grid from the region select.
- `list-show-more` appends the next page when more sites exist.

## How to get to it (user POV)

- Choose `Browse the list` on the home page.
- Choose `List` in the primary nav.
- Open `/list` directly.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- No-backend mode covers `list-open` and `list-error`.
- Live backend is required for cards, filters, and show more.

- **Nav entry.** From home, choose `List` in the nav named `Primary`. The URL is `/list` and the heading is `All upcoming Superchargers`.
- **HTTP open.** Run `.cursor/skills/verify-soonercharger/helpers/verify curl /list`. Status is `200`. The body contains `All upcoming Superchargers`, `All Statuses`, and `All Regions`.
- **Error status.** In no-backend mode, a status named `Supercharger data unavailable` appears. The message is `We're having trouble loading supercharger data right now. Please try again later.`
- **Cards.** With a live backend, each card is a link to `/charger/{id}`. The card heading is the site title. A status badge uses one of `Preliminary Planning`, `In Design`, or `Under Construction`.
- **Status filter.** Choose `Under Construction` in the status select. The grid reloads. Every visible badge is `Under Construction`.
- **Region filter.** Choose `United States` in the region select. Every visible card location includes `US` or `United States` as rendered.
- **Open card.** Choose a card heading. The URL becomes `/charger/{id}` and the detail heading matches that title.
- **Show more.** If `Show more` is visible, choose it. The button reads `Loading…` while the request runs, then more cards appear. The button is absent when every site is already shown.
- **Proof.** Save the `/list` HTTP body and a screenshot that shows the heading plus either the error status or at least one card.

## Gotchas

- Filters fire a client fetch to `/api/superchargers/soon`. A 200 list page with an error status still means the first server render failed.
- `Show more` is missing when `total` fits in the first page. Do not treat a missing button as a defect when the grid already shows every site.
- Filter selects have no accessible name. Drive them by the option strings `All Statuses` and `All Regions`.
- Changing a filter shows skeletons first. Wait for cards or the error status. Do not assert during `Loading…`.
