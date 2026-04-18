# Navigation & Layout Redesign — Options

_Last updated: April 18, 2026_

## TL;DR

Soonercharger currently has **no persistent navigation**. Every page hand-rolls
its own header and exit link, the only chrome shared site-wide is the
`<Footer>`, and there is no way to search, no way to jump straight from a
charger detail page to the list, and no sense of "where am I" once you leave
the home page.

This document:

1. Audits the current navigation experience and the problems it creates.
2. Summarises best-practice patterns for map + list apps (Airbnb, Zillow,
   Google Maps, Apple Maps, Linear, Vercel).
3. Presents **three concrete redesign approaches**, from conservative to
   ambitious, with trade-offs and a rough scope estimate for each.

The goal is to agree on a direction before implementation begins.

---

## 1. Current state audit

### Route inventory

| Route              | Purpose                                     | Layout                                                                            |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                | Landing + filterable list of upcoming sites | Huge centred hero (`app/page.tsx:27-73`), stats strip, single "View on map" pill  |
| `/map`             | Interactive global map                      | Custom slim header with "Back to list" pill (`app/map/page.tsx:44-59`)            |
| `/charger/[id]`    | Detail page for one supercharger            | No persistent nav at all; embedded map links out to `/map?charger=…`              |
| `/privacy`, `/terms` | Legal                                     | Plain back link (`app/privacy/page.tsx:13-18`)                                    |

Only `components/Footer.tsx` is mounted globally in `app/layout.tsx:65`.

### Observed problems

1. **No global anchor.** The brand "Soonercharger" only appears as an H1 on
   the home page. On every other page the user has to hunt for a back-link
   or use the browser button to return home.
2. **Asymmetric navigation.** Home → Map is a button. Map → Home is a
   different-looking button. Detail → List requires clicking the breadcrumb-less
   in-page map and then its map-page link, or using the browser back button.
3. **No list ↔ map parity.** List and map are two disconnected pages, even
   though they render the same dataset. A user filtering by region on the
   list loses that filter when switching to the map and vice-versa.
4. **No search.** With hundreds of sites there is no way to jump to a city
   or a named location; the only filtering is two dropdowns on the list
   (`components/SuperchargerList.tsx:16-81`).
5. **Above-the-fold cost.** The home hero (headline + subhead + 3-stat grid +
   "View on map" pill) consumes a full viewport on mobile before the list
   appears. Returning visitors pay that cost on every visit.
6. **Footer-only legal exits.** Privacy and terms feel orphaned — they are
   only reachable via the footer and they navigate away with a "←" link
   rather than living inside a persistent chrome.
7. **Detail page dead-ends.** From `/charger/[id]` there is no one-click way
   back to the filtered list or to see the charger _in context_ on the
   global map; the only map link jumps to the full map page.
8. **Mobile ergonomics.** On small screens the only interactive chrome is
   the two page-specific pills, both positioned in awkward spots for
   one-handed thumb reach.

### What is good and should be preserved

- Clean, quiet dark aesthetic — the data is the star.
- Fast server-rendered pages with no client-side router shell.
- Zero analytics / tracking posture (see `app/privacy/page.tsx`).
- Responsive typography via `clamp()` and shadcn-based glass cards.

Any redesign should keep the signal-to-chrome ratio high.

---

## 2. Best-practice patterns reviewed

| Pattern                           | Where it shines                                     | Exemplars                       |
| --------------------------------- | --------------------------------------------------- | ------------------------------- |
| Persistent top bar + brand        | Orientation, universal search slot                  | Vercel, GitHub, Linear          |
| Segmented "List / Map" toggle     | Unified browsing of the same dataset                | Airbnb, Zillow, Redfin          |
| Split-pane map + list             | Exploration-heavy data, "what's around here"        | Google Maps desktop, Zillow     |
| Bottom-sheet / drawer on mobile   | Keeps map context while browsing results            | Apple Maps, Google Maps mobile  |
| Command palette (⌘K)              | Power-user search + nav, minimal chrome             | Linear, Vercel, GitHub          |
| Floating action dock              | One-handed mobile nav without a full tab bar        | Arc, Raycast, newer iOS apps    |
| Shareable URL state (`?view=map`) | Deep-linking, SSR-friendly                          | All of the above                |

The three approaches below each lean on a different subset of these patterns
so the trade-offs are concrete.

---

## 3. Three redesign approaches

### Approach A — Persistent top bar + List/Map toggle _(conservative, highest ROI)_

**The idea.** Introduce a thin global header in `app/layout.tsx` with:

- Brand lockup (logo + "Soonercharger") on the left, always routing home.
- A **segmented "List / Map" toggle** in the centre that owns the primary
  browsing view. The two views render the same data and share filter state
  through the URL (`/?view=list&region=EU&q=Berlin`).
- A **search input** on the right that filters list results and pans/zooms
  the map to matches. Can start as a simple text filter; upgrade to a
  typeahead later.
- A small "About" overflow menu linking Privacy and Terms, so the footer
  can shrink to just the legal disclaimer.

Detail pages (`/charger/[id]`) keep the same chrome and gain a
**breadcrumb** ("← All sites · Berlin, DE") plus a "Show on map" pill that
deep-links to `/map?charger=…`.

**Layout shape**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger   [ List | Map ]   🔎 search   ⋯    │  ← sticky, ~56px
├───────────────────────────────────────────────────────┤
│                                                       │
│   (page content — list grid OR fullscreen map)        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Why it's good**

- Familiar, discoverable, no learning curve.
- Solves problems 1, 2, 3, 4, 6, 7 from the audit.
- Smallest code change: one new `<SiteHeader>` component, shared URL-state
  hook, a bit of work to unify list/map filter state.
- Fully SSR-friendly — search and filters are URL-driven.

**Trade-offs**

- Adds ~56px of persistent chrome; the home hero needs to be shrunk so the
  layout still feels quiet.
- "List vs Map" becomes a single page; `/map` would redirect to `/?view=map`
  (keep the old URL as a redirect to preserve any shares / SEO).
- Filter state in the URL is slightly more complex to reason about.

**Rough scope**: 2–3 days. Touches `app/layout.tsx`, adds
`components/SiteHeader.tsx`, merges `app/map` into `app/page.tsx` behind a
view param, adds a search input and URL sync hook.

---

### Approach B — Map-first split pane with bottom-sheet on mobile _(ambitious, best for exploration)_

**The idea.** Invert the current paradigm. The **map becomes the canvas for
the entire app**, and the list lives as a resizable side panel (desktop) or
bottom sheet (mobile). Detail views slide into the same panel rather than
navigating to a new page.

- Desktop: 420px left panel with filters + virtualised list; map fills the
  rest of the viewport. Drag-to-resize; collapsible to an icon rail.
- Mobile: full-screen map; bottom sheet with three snap points
  (peek / half / full) showing the list, same filters, same search. Tap a
  card and the sheet retracts to half, the map flies to the pin.
- Detail becomes a panel state, not a route change — but the URL still
  updates (`/charger/[id]`) so links stay shareable and SSR works.
- A single global top bar houses the brand and search; Privacy/Terms still
  live in the footer.

**Layout shape (desktop)**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger                          🔎 search  │
├───────────────┬───────────────────────────────────────┤
│ Filters       │                                       │
│ ──────        │                                       │
│ [ card ]      │              MAP CANVAS               │
│ [ card ]      │                                       │
│ [ card ]      │                                       │
│ [ card ]      │                                       │
└───────────────┴───────────────────────────────────────┘
```

**Why it's good**

- Matches user intent: "where are new chargers _near me_?"
- No context loss — browsing the list never hides the map.
- Detail stays in context; you can see the site on the map while reading
  about it.
- Mobile bottom-sheet is the gold standard for this kind of data.

**Trade-offs**

- Meaningful refactor. Pages move from separate routes to parallel routes or
  a single route with slot-based layout (`@panel/page.tsx`, `@map/page.tsx`
  in Next 16 parallel-routes style).
- Interactive sheet + resizable pane adds client-side complexity and more
  JS to the initial payload — counter to the current "lean SSR" feel.
- The current hero ("Soonercharger" headline + stats) needs a new home —
  maybe a small "/about" page or a dismissable banner inside the list panel
  for first-time visitors.
- Higher risk of bugs at the sheet/map interaction boundary (hit-testing,
  scroll containment, iOS Safari viewport).

**Rough scope**: 1–2 weeks. Adds
`components/SitePanel.tsx`, `components/MobileBottomSheet.tsx`, reshapes the
routing model, introduces a shared filter store.

---

### Approach C — Minimal floating dock + command palette _(innovative, preserves current aesthetic)_

**The idea.** Keep the near-zero chrome of today but make navigation
**instantaneous and keyboard-first**:

- A **floating action dock** — bottom-centre on mobile, right-edge on
  desktop — with three icon-only affordances: Home, Map, Search. It's the
  only always-on chrome besides the footer.
- A **command palette (⌘K / tap Search)** that does:
  - Instant fuzzy search across sites by title / city / region.
  - Jump-to commands ("Go to map", "Filter: under construction", "Open
    privacy policy").
  - Recent chargers.
- Detail pages open as a **modal overlay** on top of whatever you were
  looking at (list or map), preserving scroll position and context. Close
  the modal and you're back where you were. URL still updates for
  shareability.
- Legal pages become command-palette destinations; the footer stays as the
  discoverability fallback.

**Layout shape**

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│            (page content — no top chrome)             │
│                                                       │
│                                                       │
│                                                       │
│                                          ┌─────────┐  │
│                                          │ 🏠 🗺 🔎│  │  ← floating dock
│                                          └─────────┘  │
└───────────────────────────────────────────────────────┘

Pressing ⌘K:
┌─────────────────────────────┐
│ 🔎 Search sites, commands…  │
│ ──────────────────────────  │
│   Berlin-Mitte, DE          │
│   → Go to map               │
│   → Filter: under constr…   │
└─────────────────────────────┘
```

**Why it's good**

- Preserves the quiet, data-first visual identity.
- Ships a genuinely faster experience for return users (one keystroke to
  anywhere).
- Modal detail keeps users in their browsing flow.
- Very modern feel — matches the Linear/Vercel/Raycast aesthetic the current
  design is clearly gesturing towards.

**Trade-offs**

- Highest novelty → lowest initial discoverability. Needs an onboarding
  hint ("Press ⌘K to search") and the dock to be the obvious fallback.
- ⌘K patterns are weak on touch devices; the dock's 🔎 button has to open
  the same palette in a mobile-optimised sheet.
- Modal-over-route is tricky with SSR and SEO. Pattern: render the full
  page server-side on direct link, render the modal when navigated to from
  another in-app page (Next's intercepting routes, `(.)charger/[id]`).
- Accessibility bar is higher: focus management, escape handling, screen
  reader announcements for the palette and modal.

**Rough scope**: 1–2 weeks. Adds a `<CommandPalette>` (shadcn's `Command`
primitive), `<ActionDock>`, and intercepting-route versions of
`/charger/[id]`. Search backend endpoint likely needed for fuzzy lookup.

---

## 4. Comparison at a glance

| Dimension                    | A. Top bar + toggle | B. Map-first split | C. Dock + ⌘K   |
| ---------------------------- | ------------------- | ------------------ | --------------- |
| Discoverability              | ★★★                | ★★★               | ★★             |
| Exploration UX               | ★★                 | ★★★               | ★★             |
| Preserves current aesthetic  | ★★                 | ★                  | ★★★            |
| Mobile ergonomics            | ★★                 | ★★★               | ★★             |
| SEO / SSR friendliness       | ★★★                | ★★                 | ★★             |
| Implementation risk          | Low                 | High               | Medium          |
| Estimated scope              | 2–3 days            | 1–2 weeks          | 1–2 weeks       |
| Solves audit items           | 1, 2, 3, 4, 6, 7    | 1, 2, 3, 4, 5, 7, 8 | 1, 2, 4, 5, 7 |

---

## 5. Recommendation

Start with **Approach A** as a foundation — it removes the most painful nav
gaps in a few days without a rewrite. Once the unified list/map toggle and
the shared URL-state plumbing exist, either B or C becomes an incremental
evolution rather than a rebuild:

- If user feedback skews toward "I want to explore the map", evolve A into
  B by promoting the map to the canvas and demoting the list to a panel.
- If feedback skews toward "I just want to find _my_ site fast", evolve A
  into C by adding the command palette on top of the existing header.

This keeps the first shippable change small and reversible, while leaving
the door open to the more ambitious designs.

---

## 6. Open questions for discussion

1. Is the current hero (headline + stats strip) core brand or is it
   decoration we can shrink? Approach A–C all compress or remove it.
2. Do we want on-map filtering parity with the list (region, status,
   search)? All three approaches assume yes.
3. Is a search backend endpoint in scope, or do we fuzzy-match client-side
   against the `/api/superchargers/soon` payload?
4. Any SEO constraints? Merging `/map` into `/?view=map` (Approach A) would
   need a 301 redirect; modal detail pages (Approach C) need intercepting
   routes configured carefully so `/charger/[id]` stays crawlable.
