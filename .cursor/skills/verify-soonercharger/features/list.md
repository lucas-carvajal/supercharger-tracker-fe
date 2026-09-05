# Upcoming list

The list lets a visitor browse upcoming Supercharger sites, filter by status and country, load more cards, and open a site.

## Sub-features

- `list-open` opens the upcoming list from each supported entry point.
- `list-error` shows the load-error status when the backend is down.
- `list-cards` renders one card per site with title, status badge, and a link to `/charger/{id}`.
- `list-filter-status` replaces the grid from the status select.
- `list-filter-country` replaces the grid from the country select.
- `list-show-more` appends the next page when more sites exist.

## How to get to it (user POV)

- Choose `Browse the list` on the home page.
- Choose `List` in the primary nav.
- Open `/list` directly.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- Fixture mode covers `list-open`, `list-cards`, and the filters.
- `VERIFY_MODE=none` covers `list-error`.

- **Nav entry.** From home, choose `List` in the nav named `Primary`. The URL is `/list` and the heading is `All upcoming Superchargers`.
- **HTTP open.** Run `.cursor/skills/verify-soonercharger/helpers/verify curl /list`. Status is `200`. The body contains `All upcoming Superchargers`, `All Statuses`, `All Countries`, `Riverside Plaza`, `Harbor Market`, `Oak Ridge`, and `Mesa Verde`.
- **Error status.** With `VERIFY_MODE=none`, a status named `Supercharger data unavailable` appears. The message is `We're having trouble loading supercharger data right now. Please try again later.`
- **Cards.** Each card is a link to `/charger/{id}`. The four headings are `Riverside Plaza`, `Harbor Market`, `Oak Ridge`, and `Mesa Verde`. A status badge uses one of `Preliminary Planning`, `In Design`, or `Under Construction`.
- **Status filter.** Choose `Under Construction` in the status select. The grid shows `Riverside Plaza` and `Mesa Verde`. It does not show `Harbor Market`.
- **Country filter.** Choose `United States` in the country select. The grid shows the two US sites, `Riverside Plaza` and `Mesa Verde`.
- **Open card.** Choose `Riverside Plaza`. The URL becomes `/charger/riverside-plaza` and the detail heading is `Riverside Plaza`.
- **Show more.** The button is absent. The fixture catalog has only four sites, so the first page already shows every card.
- **Proof.** Save the `/list` HTTP body and a screenshot that shows the heading plus the four fixture cards. For `VERIFY_MODE=none`, save the error status instead.

## Gotchas

- Filters fire a client fetch to `/api/superchargers/soon`. A 200 list page with an error status still means the first server render failed.
- `Show more` is missing when `total` fits in the first page. Do not treat a missing button as a defect when the grid already shows every site.
- Filter selects have no accessible name. Drive them by the option strings `All Statuses` and `All Countries`.
- Changing a filter shows skeletons first. Wait for cards or the error status. Do not assert during `Loading…`.
