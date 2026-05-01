# Charger Status Updates Page Plan

## Task context

Add a new public page at `app/(public)/status-updates/page.tsx` to show the latest status transitions for tracked chargers, in addition to the existing map and list pages. The backend endpoint is `GET /superchargers/soon/recent-changes`, and this UI should only show the most recent 20 changes with no load-more behavior.

Agreed behavior and UX details:

- Page name: **Charger Status Updates**
- Route: `/status-updates`
- Include in primary navigation and homepage CTA options
- Include in sitemap/indexing
- Row content: title, transition text, and date (no time)
- If `old_status` is `UNKNOWN`, render transition as `-> NEW STATUS`
- If `new_status` is:
  - `OPENED`: click opens Tesla page using slug-style URL `https://www.tesla.com/findus?location=<id>`
  - `REMOVED`: click shows a sad emoji that floats upward (no navigation)
  - any other value: click opens internal charger detail page `/charger/[id]`
- Reuse existing status-label mapping and color/badge conventions where appropriate

## API contract summary

Endpoint:

- `GET /superchargers/soon/recent-changes?limit=20&offset=0`

Important fields used by the page:

- `items[].id`
- `items[].title`
- `items[].old_status`
- `items[].new_status`
- `items[].changed_at`

Status values expected in this feed:

- `IN_DEVELOPMENT`
- `UNDER_CONSTRUCTION`
- `OPENED`
- `REMOVED`
- `UNKNOWN` is possible only as `old_status`

## Implementation plan

1. **Data layer updates (`lib/api.ts`)**
   - Add `RecentStatusChange` and `RecentStatusChangesResponse` interfaces.
   - Add `getRecentStatusChanges(limit = 20)` helper targeting `/superchargers/soon/recent-changes`.
   - Keep existing fetch/revalidate conventions used by other public data helpers.

2. **New public route (`app/(public)/status-updates/page.tsx`)**
   - Add page metadata:
     - Title: `Charger Status Updates`
     - Description for public search/social previews
     - Canonical and OpenGraph URL set to `/status-updates`
   - Fetch exactly 20 rows server-side.
   - Render failure state using existing overlay/error style patterns.

3. **Status updates UI component**
   - Add a dedicated component (for example `components/StatusUpdatesList.tsx`) that renders the fixed result set.
   - Display per row:
     - Charger title (with fallback when missing)
     - Transition text (`old -> new`, with `UNKNOWN` old-status omission)
     - Date-only value from `changed_at`
   - Use existing status spelling/mapping conventions so labels stay consistent with the rest of the app.
   - Reuse existing card styling patterns (`GlassCard`) for visual consistency.

4. **Click behavior by transition type**
   - `OPENED`: external anchor to `https://www.tesla.com/findus?location=<id>`.
   - `REMOVED`: interactive row action that triggers a floating sad emoji effect and does not navigate.
   - Other statuses: internal navigation to `/charger/[id]`.
   - For the emoji effect, implement a motion-safe animation and respect reduced-motion preferences.

5. **Navigation and discovery**
   - Update `components/SiteHeader.tsx` nav items to include `Status Updates`.
   - Update homepage CTAs in `app/(public)/page.tsx` to include the new page alongside List/Map.

6. **SEO and indexing**
   - Add `/status-updates` static entry to `app/sitemap.ts`.
   - Update `docs/seo.md` to mention the new indexed public route and metadata/canonical coverage.

7. **Validation**
   - Run `npm run lint` for JSX/TS and docs-adjacent changes.
   - Run `npm run build` because a new route and sitemap metadata are involved.

## Date formatting precedent

There is a current project precedent for date-only display in the charger detail page:

- `Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })`

Recommendation: reuse this exact formatter for the status-updates page to keep date presentation consistent.

## Open questions / tradeoffs

1. **Animation density**
   - If a user repeatedly clicks many `REMOVED` rows quickly, decide whether to:
     - spawn one emoji per click (more playful, potentially noisy), or
     - debounce/limit to one active emoji per row (cleaner, lower visual load).

2. **Title fallback copy**
   - If `title` is missing, decide the fallback string (for example: `Unnamed location` vs `Unknown location`).

3. **External link affordance for OPENED**
   - Consider adding a subtle external-link icon or helper text so users know they are leaving Soonercharger.
