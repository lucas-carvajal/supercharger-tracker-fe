# Navigation & Layout Redesign — Options

_Last updated: April 18, 2026_

## TL;DR

Soonercharger currently has **no persistent navigation**. Every page hand-rolls
its own header and exit link, the only chrome shared site-wide is the
`<Footer>`, and there is no way to jump straight from a charger detail page
back to the list, and no sense of "where am I" once you leave the home page.

On top of that, the home page today does double duty: it's both the brand
landing and the filterable list. That conflates two jobs.

This document:

1. Audits the current navigation experience and the problems it creates.
2. Summarises best-practice patterns for map + list apps (Airbnb, Zillow,
   Google Maps, Apple Maps, Linear, Vercel).
3. Presents **two concrete redesign approaches**, from conservative to
   ambitious, with trade-offs and a rough scope estimate for each.

The goal is to agree on a direction before implementation begins.

**Route split (by request):**

- **`/` becomes a pure landing page.** General info about the project —
  what it is, why it exists, headline stats — with two clear calls to
  action: "Browse the list" and "Open the map". No list or map UI on
  `/` itself.
- **`/list` (new) hosts the filterable list** that currently lives on `/`.
- **`/map` stays as it is** — the interactive global map.
- **`/charger/[id]` stays as it is** — the detail page.

**Out of scope (by request):**

- **Search.** A proper search box / command palette / typeahead is
  deferred. The list's existing filter dropdowns are enough for now.
  Revisit once the nav/layout changes land and we have real usage data.
- **List ↔ map parity.** The list and the map are intentionally distinct
  destinations and do not need to share filter state.
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

### Route inventory (today)

| Route                | Purpose                                     | Layout                                                                            |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                  | Landing + filterable list of upcoming sites | Huge centred hero (`app/page.tsx:27-73`), stats strip, single "View on map" pill  |
| `/map`               | Interactive global map                      | Custom slim header with "Back to list" pill (`app/map/page.tsx:44-59`)            |
| `/charger/[id]`      | Detail page for one supercharger            | No persistent nav at all; embedded map links out to `/map?charger=…`              |
| `/privacy`, `/terms` | Legal                                       | Plain back link (`app/privacy/page.tsx:13-18`)                                    |

Only `components/Footer.tsx` is mounted globally in `app/layout.tsx:65`.

### Route inventory (target)

| Route                | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `/`                  | **Landing** — general info + links to list & map   |
| `/list` **(new)**    | Filterable list of upcoming sites                  |
| `/map`               | Interactive global map                             |
| `/charger/[id]`      | Detail page for one supercharger                   |
| `/privacy`, `/terms` | Legal (footer links only)                          |

The list UI currently in `app/page.tsx` moves wholesale to `app/list/page.tsx`;
`/` becomes a short, quiet landing with stats and two CTAs.

### Observed problems

1. **No global anchor.** The brand "Soonercharger" only appears as an H1 on
   the home page. On every other page the user has to hunt for a back-link
   or use the browser button to return home.
2. **Asymmetric navigation.** Home → Map is a button. Map → Home is a
   different-looking button. Detail → List requires clicking the breadcrumb-less
   in-page map and then its map-page link, or using the browser back button.
3. **Home does two jobs.** `/` is both the brand landing and the list. The
   hero + stats + "View on map" pill push the list below the fold, and a
   returning user who just wants the list still pays the hero cost.
4. **Detail page dead-ends.** From `/charger/[id]` there is no one-click way
   back to the list or to see the charger _in context_ on the global map;
   the only map link jumps to the full map page with no way back.
5. **Mobile ergonomics.** On small screens the only interactive chrome is
   the two page-specific pills, positioned inconsistently across pages.

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
| Persistent top bar + brand        | Orientation, consistent back-to-home                | Vercel, GitHub, Linear          |
| Tabbed primary nav (List / Map)   | Two equally-important destinations                  | iOS App Store, Spotify          |
| Bottom tab bar on mobile          | Thumb-reachable primary nav on small screens        | Most native iOS/Android apps    |
| Bottom-sheet / drawer on mobile   | Keeps map context while inspecting a pin            | Apple Maps, Google Maps mobile  |
| Breadcrumbs on detail pages       | "Where am I, how do I get back"                     | Most content sites              |
| Short hub landing + CTAs          | Clear entry point for new visitors                  | Vercel, Stripe, Linear marketing|

The two approaches below lean on different subsets of these patterns so
the trade-offs are concrete.

---

## 3. Two redesign approaches

Both approaches share the same **landing + route split** and the same
**global nav shell**. They differ in how ambitious the `/map` experience
becomes.

### Shared foundation (both approaches)

**Landing (`/`).** A short, quiet page:

- Brand lockup + one-line tagline.
- The existing stats strip (total sites, countries, etc.) — this is the
  most interesting thing about the project for a first-time visitor.
- Two prominent CTAs: **"Browse the list"** → `/list` and
  **"Open the map"** → `/map`.
- Optionally: a small "recently added" or "opening soon" teaser row
  (3–5 sites) to give the page substance without becoming a full list.
- Footer as today.

**List (`/list`).** The existing home-page list, moved wholesale.
Filter dropdowns stay as they are (`components/SuperchargerList.tsx:16-81`).

**Global nav shell.** A thin site-wide header with:

- Brand lockup (logo + "Soonercharger") on the left, always routing to `/`.
- Two **primary nav links** — "List" (→ `/list`) and "Map" (→ `/map`) —
  that highlight the active route.

On mobile, the top bar is the **only** chrome — no bottom tab bar. It
shrinks to:

- **Logo only** on the left (the "Soonercharger" wordmark is dropped
  to save space), still routing to `/`.
- **Two icon buttons** aligned right — a list glyph for `/list` and a
  map-pin glyph for `/map`. Each is a 44×44 px tap target; the active
  route is indicated with a filled background / accent colour.

This keeps the screen fully available for the list or map and matches
the quiet aesthetic. The thumb-reach tradeoff (top-right is harder on
large phones) is acceptable given only two destinations and infrequent
switching.

Detail pages (`/charger/[id]`) gain a **breadcrumb** ("← All sites ·
Berlin, DE") plus a small "Show on map" pill that deep-links to
`/map?charger=…`.

**Layout shape (desktop)**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger          List · Map                 │  ← sticky, ~56px
├───────────────────────────────────────────────────────┤
│                                                       │
│   (page content — landing, list, or fullscreen map)   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**On mobile (shared)**

```
┌──────────────────────────┐
│  ⚡               📋  🗺  │  ← top bar (~48px, logo + nav icons)
├──────────────────────────┤
│                          │
│      page content        │
│                          │
│                          │
└──────────────────────────┘
```

- Body uses `min-h-[100dvh]` (not `vh`) so the layout doesn't jump when
  iOS Safari toolbars hide/show.
- Top bar honours `env(safe-area-inset-top)` so the icons never hide
  behind the notch / Dynamic Island.
- Detail-page breadcrumb becomes a single back-arrow button anchored
  top-left, sized 44×44 px (Apple HIG minimum).

---

### Approach A — Landing split + persistent nav _(conservative, highest ROI)_

**The idea.** Ship exactly the shared foundation above and stop there.

- `/` becomes the info-hub landing.
- `/list` is the existing list, moved.
- `/map` is unchanged except for getting the new header / bottom tab
  bar and losing its bespoke "Back to list" pill.
- `/charger/[id]` gets the breadcrumb + "Show on map" pill.

No inline map detail panel, no sheet, no new map chrome.

**Why it's good**

- Familiar, discoverable, no learning curve.
- Solves every problem in the audit in one pass.
- Smallest code change: one new `<SiteHeader>` + `<MobileTabBar>` pair,
  a new `app/list/page.tsx`, and a slimmed `app/page.tsx`. `/list` and
  `/map` stay independent — no shared state to plumb.
- Fully SSR-friendly. Header and tab bar both render on the server.
- The bottom tab bar pattern is what iOS / Android users already expect.

**Trade-offs**

- Adds ~56px of persistent chrome on desktop and ~48px on mobile.
  The landing has no hero to shrink, so this is fine; list and map
  both absorb it cleanly.
- Top-right nav icons on mobile trade thumb-reach for screen real
  estate. Acceptable for two infrequently-switched destinations;
  revisit if we ever add a third.
- Moving the list to `/list` changes the canonical URL for the main
  destination. Audit any hard-coded links in emails / social / OG
  cards that point at `/` expecting a list.

**Rough scope**: 2–3 days. Adds `components/SiteHeader.tsx`,
`components/MobileTabBar.tsx`, `app/list/page.tsx`, slims
`app/page.tsx` to a landing, removes the bespoke headers on `/map`
and `/charger/[id]`, and adds the breadcrumb component.

---

### Approach B — Approach A + map-first detail _(ambitious, best for exploration)_

**The idea.** Everything in Approach A, plus make `/map` a richer,
exploration-grade experience.

- Clicking a pin opens an **inline detail panel** (desktop: right-side
  drawer; mobile: bottom sheet with peek / half / full snap points) that
  shows the same data as `/charger/[id]` without losing the map context.
  An "Open full page" link still routes to `/charger/[id]` for sharing.
- The list page (`/list`) is untouched beyond the shared foundation.
- Detail pages keep the breadcrumb from Approach A.

**Layout shape (map page, desktop)**

```
┌───────────────────────────────────────────────────────┐
│  ⚡ Soonercharger          List · Map                 │
├───────────────────────────────────────────────────────┤
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

- The map page is **fullscreen** under the shared top bar / bottom tab
  bar.
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
- Uses `dvh` for sheet heights so iOS toolbar collapse doesn't break
  layouts. Honours `env(safe-area-inset-bottom)` so the sheet handle
  never hides behind the home indicator.
- The sheet and the bottom tab bar need to coexist: when the sheet is
  at peek it sits **above** the tab bar; at half/full it slides over
  the tab bar and the tab bar animates out.
- Map performance: limit visible pin count via clustering (already
  hinted at in `components/SuperchargerMap.tsx`), use
  `prefers-reduced-motion` to skip fly-to animations.

```
mobile shape (map page):

┌──────────────────────────┐
│  ⚡                      │
├──────────────────────────┤
│                          │
│        MAP CANVAS        │
│                          │
│    ╭──────────────────╮  │
│    │ Berlin-Mitte, DE │  │  ← bottom sheet (peek)
│    │ Under construction│  │     drag up for more
│    ╰──────────────────╯  │
├──────────────────────────┤
│  🏠    List    |   Map   │
└──────────────────────────┘
```

**Why it's good**

- Matches user intent on the map page: "what is this pin? where is it?"
  without losing the view.
- Mobile bottom-sheet is the gold standard for map-driven detail
  (Apple Maps, Google Maps) — the interaction is what iOS/Android
  users already know.
- Doesn't touch the list page's UX.

**Trade-offs**

- Inline detail panel is a real chunk of client-side work — sheet snap
  points, focus management, scroll containment, iOS Safari viewport
  edge cases, coexistence with the bottom tab bar.
- Adds JS to the `/map` route; counter to the current "lean SSR" feel
  for that page. Sheet should be code-split so the JS only loads on
  `/map`.
- Pin → panel and panel → `/charger/[id]` need to stay in sync so
  direct links keep working.
- Touch gesture handling on the sheet has to coexist cleanly with
  MapLibre's pan/pinch — needs careful event hit-testing, especially
  on Android Chrome.

**Rough scope**: ~1 week on top of Approach A. Adds
`components/MapDetailPanel.tsx` and `components/MapBottomSheet.tsx`,
and refactors the click handler in `components/SuperchargerMap.tsx`.

---

## 4. Comparison at a glance

| Dimension                    | A. Landing split + nav | B. A + map-first detail |
| ---------------------------- | ---------------------- | ----------------------- |
| Discoverability              | ★★★                   | ★★★                    |
| Exploration UX               | ★★                    | ★★★                    |
| Preserves current aesthetic  | ★★★                   | ★★                     |
| Mobile ergonomics            | ★★★                   | ★★★                    |
| SEO / SSR friendliness       | ★★★                   | ★★                     |
| Implementation risk          | Low                    | Medium                  |
| Estimated scope              | 2–3 days               | ~1 week (on top of A)   |
| Solves audit items           | 1, 2, 3, 4, 5          | 1, 2, 3, 4, 5           |

### Cross-cutting mobile checklist (applies to both approaches)

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
      pages — don't ship them on the landing or list pages.
- [ ] Test on real devices: iPhone SE (small), iPhone 15 Pro
      (Dynamic Island), Pixel 7 (Android Chrome gesture nav), and
      iPad (split-view widths).
- [ ] Verify the layout on iOS Safari with both URL-bar visible and
      collapsed; the sticky top bar must not jump.
- [ ] Lighthouse mobile score ≥ 90 for Performance and Accessibility
      after the change.

---

## 5. Recommendation

Ship **Approach A** first. It is the whole foundation: landing split,
`/list` route, global header, mobile bottom tab bar, detail breadcrumb.
That single change removes every item in the audit in a few days and
is fully reversible.

Then, if real usage shows people want to explore the map more deeply
(long sessions on `/map`, bounces from `/charger/[id]` back to `/map`),
layer on **Approach B**'s inline detail panel. B is additive — it
doesn't rework A, it just makes the map page richer.

---

## 6. Open questions for discussion

1. Does the landing need the "recently added / opening soon" teaser row,
   or is brand + stats + two CTAs enough? Simpler is probably better for
   a first cut.
2. Anything linking externally to `/` expecting the list (OG cards,
   social posts, emails)? If yes, decide whether to redirect or accept
   that those land on the new landing page (which then links to the list
   one tap away).
