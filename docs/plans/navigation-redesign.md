# Navigation & Layout Redesign — Options

_Last updated: April 18, 2026_

## TL;DR

Soonercharger currently has **no persistent navigation**. Every page hand-rolls
its own header and exit link, the only chrome shared site-wide is the
`<Footer>`, and there is no way to search, no way to jump straight from a
charger detail page back to the list, and no sense of "where am I" once you
leave the home page.

This document:

1. Audits the current navigation experience and the problems it creates.
2. Summarises best-practice patterns for map + list apps (Airbnb, Zillow,
   Google Maps, Apple Maps, Linear, Vercel).
3. Presents **three concrete redesign approaches**, from conservative to
   ambitious, with trade-offs and a rough scope estimate for each.

The goal is to agree on a direction before implementation begins.

**Out of scope (by request):**

- **List ↔ map parity.** The list and the map are intentionally distinct
  destinations and do not need to share filter / search state.
- **Promoting Privacy / Terms.** Those pages stay where they are — linked
  from the footer only.

**Hard requirement: mobile-first.** A large share of visitors arrive on
iOS and Android. Every approach below is evaluated and described as a
**mobile-first design**, with the desktop layout treated as the
adaptation, not the other way round. Every section includes an explicit
"On mobile" note covering thumb-reach, sheet behaviour, viewport
(`dvh` / safe-area insets), and offline-ish (slow 4G) payload.

---

## 1. Current state audit

### Route inventory

| Route                | Purpose                                     | Layout                                                                            |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                  | Landing + filterable list of upcoming sites | Huge centred hero (`app/page.tsx:27-73`), stats strip, single "View on map" pill  |
| `/map`               | Interactive global map                      | Custom slim header with "Back to list" pill (`app/map/page.tsx:44-59`)            |
| `/charger/[id]`      | Detail page for one supercharger            | No persistent nav at all; embedded map links out to `/map?charger=…`              |
| `/privacy`, `/terms` | Legal                                       | Plain back link (`app/privacy/page.tsx:13-18`)                                    |

Only `components/Footer.tsx` is mounted globally in `app/layout.tsx:65`.

### Observed problems

1. **No global anchor.** The brand "Soonercharger" only appears as an H1 on
   the home page. On every other page the user has to hunt for a back-link
   or use the browser button to return home.
2. **Asymmetric navigation.** Home → Map is a button. Map → Home is a
   different-looking button. Detail → List requires clicking the breadcrumb-less
   in-page map and then its map-page link, or using the browser back button.
3. **No search.** With hundreds of sites there is no way to jump to a city
   or a named location; the only filtering is two dropdowns on the list
   (`components/SuperchargerList.tsx:16-81`).
4. **Above-the-fold cost.** The home hero (headline + subhead + 3-stat grid +
   "View on map" pill) consumes a full viewport on mobile before the list
   appears. Returning visitors pay that cost on every visit.
5. **Detail page dead-ends.** From `/charger/[id]` there is no one-click way
   back to the list or to see the charger _in context_ on the global map;
   the only map link jumps to the full map page with no way back.
6. **Mobile ergonomics.** On small screens the only interactive chrome is
   the two page-specific pills, both positioned in awkward spots for
   one-handed thumb reach.

### What is good and should be preserved

- Clean, quiet dark aesthetic — the data is the star.
- Fast server-rendered pages with no client-side router shell.
- Zero analytics / tracking posture (see `app/privacy/page.tsx`).
- Responsive typography via `clamp()` and shadcn-based glass cards.
- The footer as the home for legal links — no need to surface them higher.

Any redesign should keep the signal-to-chrome ratio high.

---

## 2. Best-practice patterns reviewed

| Pattern                           | Where it shines                                     | Exemplars                       |
| --------------------------------- | --------------------------------------------------- | ------------------------------- |
| Persistent top bar + brand        | Orientation, universal search slot                  | Vercel, GitHub, Linear          |
| Tabbed primary nav (List / Map)   | Two equally-important destinations                  | iOS App Store, Spotify          |
| Bottom-sheet / drawer on mobile   | Keeps map context while inspecting a pin            | Apple Maps, Google Maps mobile  |
| Command palette (⌘K)              | Power-user search + nav, minimal chrome             | Linear, Vercel, GitHub          |
| Floating action dock              | One-handed mobile nav without a full tab bar        | Arc, Raycast, newer iOS apps    |
| Breadcrumbs on detail pages       | "Where am I, how do I get back"                     | Most content sites              |

The three approaches below each lean on a different subset of these patterns
so the trade-offs are concrete.

---

## 3. Three redesign approaches

### Approach A — Persistent top bar with primary nav _(conservative, highest ROI)_

**The idea.** Introduce a thin global header in `app/layout.tsx` with:

- Brand lockup (logo + "Soonercharger") on the left, always routing to `/`.
- Two **primary nav links** — "List" and "Map" — that highlight the active
  route. List and Map remain **separate pages** with their own state; the
  nav is just a fast switcher.
- A **search input** on the right that scopes to the current page (filters
  the list on `/`, pans/zooms / pin-filters on `/map`). Implemented as a
  simple text filter to start; can grow into a typeahead later.

Detail pages (`/charger/[id]`) keep the same chrome and gain a
**breadcrumb** ("← All sites · Berlin, DE") plus a small "Show on map" pill
that deep-links to `/map?charger=…`.

**Layout shape**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger    List · Map         🔎 search     │  ← sticky, ~56px
├───────────────────────────────────────────────────────┤
│                                                       │
│   (page content — list grid OR fullscreen map)        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**On mobile**

- Header collapses to ~48px. Layout is: brand-mark only on the left,
  search **icon** on the right (taps to expand into a full-width
  search overlay that animates down from the header).
- The "List · Map" switcher moves to a **bottom tab bar** (~56px,
  safe-area-aware via `env(safe-area-inset-bottom)`). Two large,
  thumb-reachable targets — the only persistent bottom chrome.
- Body uses `min-h-[100dvh]` (not `vh`) so the layout doesn't jump when
  iOS Safari toolbars hide/show.
- Footer pushes below the bottom tab bar with extra padding so the
  privacy/terms links remain reachable but never overlap.
- Detail-page breadcrumb becomes a single back-arrow button anchored
  top-left, sized 44×44 px (Apple HIG minimum).

```
mobile shape:

┌──────────────────────────┐
│  ⚡                  🔎 │  ← top bar (~48px)
├──────────────────────────┤
│                          │
│      page content        │
│                          │
├──────────────────────────┤
│   List   |    Map        │  ← bottom tab bar (~56px + safe area)
└──────────────────────────┘
```

**Why it's good**

- Familiar, discoverable, no learning curve.
- Solves problems 1, 2, 3, 5, 6 from the audit.
- Smallest code change: one new `<SiteHeader>` + `<MobileTabBar>` pair
  plus a per-page search hook. `/` and `/map` stay independent — no
  shared state to plumb.
- Fully SSR-friendly. Tab bar and header both render on the server.
- The bottom tab bar pattern is what iOS / Android users already expect,
  so it carries no learning cost on the platforms we expect most
  traffic from.

**Trade-offs**

- Adds ~56px of persistent chrome on desktop and ~48px top + ~56px
  bottom on mobile. The home hero needs to be shrunk so the layout
  still feels quiet.
- Search behaviour differs slightly between the two pages (filter rows
  vs. filter pins). Needs a clear, consistent placeholder ("Search this
  list", "Search the map") so the difference doesn't feel like a bug.
- Two pieces of chrome (top bar + bottom tab bar) on mobile to keep in
  visual sync.

**Rough scope**: 2–3 days. Adds `components/SiteHeader.tsx`,
`components/MobileTabBar.tsx`, a small `useScopedSearch` hook, and
per-page wiring. No routing changes.

---

### Approach B — Map-first redesign (without merging list and map) _(ambitious, best for exploration)_

**The idea.** Keep the home/list page largely as it is today, but **make
`/map` a richer, exploration-grade experience** with the same global header
from Approach A.

- The map page gains a **floating search box** (top-left) and a
  **filter chip strip** (under the header) for status / region — but these
  are scoped to the map only and are not shared with the list page.
- Clicking a pin opens an **inline detail panel** (desktop: right-side
  drawer; mobile: bottom sheet with peek / half / full snap points) that
  shows the same data as `/charger/[id]` without losing the map context.
  A "Open full page" link still routes to `/charger/[id]` for sharing.
- The list page (`/`) keeps its current layout, just with the new global
  header on top.
- Detail pages keep the breadcrumb from Approach A.

**Layout shape (map page, desktop)**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger    List · Map         🔎 search     │
├───────────────────────────────────────────────────────┤
│  [ Status ▾ ] [ Region ▾ ]                            │
│                                                       │
│                                          ┌──────────┐ │
│                                          │ Berlin…  │ │
│           MAP CANVAS                     │ Status…  │ │
│                                          │ Timeline │ │
│                                          │ [Open ↗] │ │
│                                          └──────────┘ │
└───────────────────────────────────────────────────────┘
```

**On mobile**

- The map page is **fullscreen** under the global header / bottom tab
  bar from Approach A.
- Pin tap opens a **bottom sheet** with three snap points:
  - **Peek (~96px)** — title, status badge, distance/region. Map stays
    fully interactive above it.
  - **Half (~50dvh)** — adds the timeline and address. Map flies the
    pin into the visible upper half automatically.
  - **Full (calc(100dvh - safe-area-top))** — full detail; map is
    hidden behind. "Open full page" link in the sheet header routes
    to `/charger/[id]` for sharing.
- Sheet supports **swipe down to dismiss** and **tap-outside-to-peek**.
  Background scroll is locked while the sheet is dragging.
- The map's floating search box uses the **expand-from-icon** pattern
  (small magnifying glass top-left → full-width pill on tap). Filter
  chips collapse into a single "Filters" pill that opens its own
  smaller bottom sheet.
- Uses `dvh` for sheet heights so iOS toolbar collapse doesn't break
  layouts. Honours `env(safe-area-inset-bottom)` so the sheet handle
  never hides behind the home indicator.
- Map performance: limit visible pin count via clustering (already
  hinted at in `components/SuperchargerMap.tsx`), use `prefers-reduced-motion`
  to skip fly-to animations.

```
mobile shape (map page):

┌──────────────────────────┐
│  ⚡                  🔎 │
├──────────────────────────┤
│  🔎  [Filters ▾]         │
│                          │
│        MAP CANVAS        │
│                          │
│    ╭──────────────────╮  │
│    │ Berlin-Mitte, DE │  │  ← bottom sheet (peek)
│    │ Under construction│  │     drag up for more
│    ╰──────────────────╯  │
├──────────────────────────┤
│   List   |    Map        │
└──────────────────────────┘
```

**Why it's good**

- Matches user intent on the map page: "what is this pin? where is it?"
  without losing the view.
- Mobile bottom-sheet is the gold standard for map-driven detail
  (Apple Maps, Google Maps) — the interaction is what iOS/Android
  users already know.
- Doesn't touch the list page's existing filter UX.

**Trade-offs**

- Inline detail panel is a real chunk of client-side work — sheet snap
  points, focus management, scroll containment, iOS Safari viewport
  edge cases.
- Adds JS to the `/map` route; counter to the current "lean SSR" feel
  for that page. Sheet should be code-split so the JS only loads on
  `/map`.
- Pin → panel and panel → `/charger/[id]` need to stay in sync so
  direct links keep working.
- Touch gesture handling on the sheet has to coexist cleanly with
  MapLibre's pan/pinch — needs careful event hit-testing, especially
  on Android Chrome.

**Rough scope**: ~1 week on top of Approach A. Adds
`components/MapDetailPanel.tsx` and `components/MapBottomSheet.tsx`, a
floating search/filter bar for the map page, and refactors the click
handler in `components/SuperchargerMap.tsx`.

---

### Approach C — Minimal floating dock + command palette _(innovative, preserves current aesthetic)_

**The idea.** Skip the persistent top bar entirely. Keep the near-zero
chrome of today but make navigation **instantaneous and keyboard-first**:

- A **floating action dock** — bottom-centre on mobile, right-edge on
  desktop — with three icon-only affordances: Home, Map, Search.
- A **command palette (⌘K / tap Search)** that does:
  - Instant fuzzy search across sites by title / city / region.
  - Jump-to commands ("Go to map", "Filter list: under construction",
    "Back home").
  - Recent chargers.
- Detail pages open as a **modal overlay** on top of whatever you were
  looking at (list or map), preserving scroll position and context. Close
  the modal and you're back where you were. URL still updates for
  shareability via Next 16 intercepting routes.
- Privacy and Terms remain footer-only — they are not command-palette
  destinations.

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

**On mobile**

- The dock anchors **bottom-centre, ~16px above the home indicator**
  via `bottom: calc(16px + env(safe-area-inset-bottom))`. Three large
  (44×44 px) icon targets — 🏠 Home, 🗺 Map, 🔎 Search.
- Tapping 🔎 opens the command palette as a **full-screen sheet** with
  the search field pinned to the top under the safe-area top inset,
  keyboard-aware so the result list doesn't vanish under the on-screen
  keyboard. (Uses `visualViewport` to recompute height when the
  keyboard opens.)
- Detail "modal" on mobile is also a **full-screen sheet** that slides
  up from the dock. Swipe-down to dismiss; URL still updates so
  share-sheet copies the canonical `/charger/[id]` link.
- The dock auto-hides on downward scroll and reappears on upward scroll
  (mobile-only) so it doesn't cover content the user is reading.
- No top chrome means more vertical space for the list / map on small
  screens — the biggest mobile win of this approach.

```
mobile shape:

┌──────────────────────────┐
│                          │
│       page content       │
│                          │
│                          │
│        ┌──────────┐      │
│        │ 🏠 🗺 🔎 │      │  ← floating dock
│        └──────────┘      │     (auto-hides on scroll)
└──────────────────────────┘
```

**Why it's good**

- Preserves the quiet, data-first visual identity.
- Ships a genuinely faster experience for return users (one tap or
  keystroke to anywhere).
- Modal detail keeps users in their browsing flow.
- On mobile, the dock occupies ~64px instead of A's ~104px (top + tab
  bar) — more screen for the actual data.
- Very modern feel — matches the Linear/Vercel/Raycast aesthetic the
  current design is clearly gesturing towards.

**Trade-offs**

- Highest novelty → lowest initial discoverability. Needs an onboarding
  hint ("Press ⌘K to search" on desktop, "Tap 🔎 to find a site" on
  mobile) and the dock to be the obvious fallback.
- ⌘K patterns are weak on touch devices; the mobile experience leans
  almost entirely on the dock + the full-screen palette sheet, so those
  must be very polished.
- The "auto-hide on scroll" dock pattern is divisive — needs a setting
  or careful tuning to avoid feeling jumpy.
- Modal-over-route is tricky with SSR and SEO. Pattern: render the full
  page server-side on direct link, render the modal when navigated to
  from another in-app page (Next 16 intercepting routes,
  `(.)charger/[id]`).
- Accessibility bar is higher: focus management, escape / swipe-down
  handling, screen reader announcements for the palette and modal.

**Rough scope**: 1–2 weeks. Adds a `<CommandPalette>` (shadcn's `Command`
primitive), `<ActionDock>`, and intercepting-route versions of
`/charger/[id]`. Search backend endpoint likely needed for fuzzy lookup.

---

## 4. Comparison at a glance

| Dimension                    | A. Top bar + nav | B. Map-first redesign | C. Dock + ⌘K |
| ---------------------------- | ---------------- | --------------------- | ------------- |
| Discoverability              | ★★★             | ★★★                  | ★★           |
| Exploration UX               | ★★              | ★★★                  | ★★           |
| Preserves current aesthetic  | ★★              | ★★                   | ★★★          |
| Mobile ergonomics            | ★★★             | ★★★                  | ★★★          |
| Vertical space on mobile     | ★★ (top+tab)    | ★★ (top+tab)         | ★★★ (dock)   |
| SEO / SSR friendliness       | ★★★             | ★★                   | ★★           |
| Implementation risk          | Low              | Medium                | Medium        |
| Estimated scope              | 2–3 days         | ~1 week (on top of A) | 1–2 weeks     |
| Solves audit items           | 1, 2, 3, 5, 6    | 1, 2, 3, 5, 6         | 1, 2, 3, 4, 5 |

### Cross-cutting mobile checklist (applies to all three approaches)

These should be enforced regardless of which approach we pick:

- [ ] Use `100dvh` / `min-h-[100dvh]` instead of `vh` for full-height
      layouts — iOS Safari toolbar collapse breaks `vh`.
- [ ] Honour safe-area insets on **top** (notch / Dynamic Island),
      **bottom** (home indicator), and **sides** (landscape).
- [ ] Tap targets ≥ 44×44 px (Apple HIG) / ≥ 48×48 dp (Material).
- [ ] Sticky/floating chrome must not cover the content beneath it —
      add equivalent padding on the scroll container.
- [ ] Test thumb-reach: primary actions in the lower 2/3 of the screen
      on phones up to 6.7".
- [ ] Honour `prefers-reduced-motion` for sheet animations and map
      fly-to.
- [ ] Lazy-load MapLibre + map tiles only on `/map` and on detail
      pages — don't ship them on the list page.
- [ ] Test on real devices: iPhone SE (small), iPhone 15 Pro
      (Dynamic Island), Pixel 7 (Android Chrome gesture nav), and
      iPad (split-view widths).
- [ ] Verify the layout on iOS Safari with both URL-bar visible and
      collapsed; the bottom chrome (tab bar / dock) must not jump.
- [ ] Lighthouse mobile score ≥ 90 for Performance and Accessibility
      after the change.

---

## 5. Recommendation

Start with **Approach A** as a foundation — it removes the most painful nav
gaps in a few days without a rewrite. Once the global header and per-page
search exist, either B or C becomes an incremental layer rather than a
rebuild:

- If user feedback skews toward "I want to explore the map", layer B's
  inline detail panel onto the existing map page.
- If feedback skews toward "I just want to find _my_ site fast", layer C's
  command palette on top of (or in place of) the header.

This keeps the first shippable change small and reversible, while leaving
the door open to the more ambitious designs.

---

## 6. Open questions for discussion

1. Is the current hero (headline + stats strip) core brand or is it
   decoration we can shrink? Approach A–C all compress or remove it.
2. Is a search backend endpoint in scope, or do we fuzzy-match client-side
   against the `/api/superchargers/soon` payload?
3. Any SEO constraints to be aware of for Approach C? Modal detail pages
   need intercepting routes configured carefully so `/charger/[id]` stays
   crawlable as a full page on direct link.
