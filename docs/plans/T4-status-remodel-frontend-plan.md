# T4 — Status re-model: frontend change plan

**Status:** analysis only — no code changed yet. Decisions confirmed with product (see §0).
**Source of truth:** backend `docs/API.md` (verified) + the T4 frontend prompt + product confirmation.
**Deploy constraint:** ships **in lockstep with the backend** — a hard break is accepted. The `status`
vocabulary flips all at once with no transition window (see Risks).

---

## 0. Confirmed scope — which additive fields exist

Only **three** new fields are exposed on coming-soon chargers (confirmed by product). The structured
address fields and `installed_full_power_kw` are stored on the backend but **not exposed via the API**
— there is nothing for the FE to display, and they are dropped from this plan entirely.

| Field | Exposed? | FE action |
|---|---|---|
| `num_charger_stalls` (int; `0` = unknown) | **Yes** | **Add** |
| `charging_accessibility` (string\|null) | **Yes** | **Add** |
| `raw_project_status` (string\|null, informational) | **Yes** | Optional |
| `street_address`, `county`, `postal_code`, `country_code` | **No** (DB only, no API consumer) | **None — out of scope** |
| `installed_full_power_kw` (opened chargers) | **No** (not in public read API; also no opened-charger view in this FE) | **None — out of scope** |

`raw_status_value` is unchanged and stays required; `raw_project_status` is the new informational sibling.

---

## 1. Stack & where status lives

- **Framework:** Next.js 16 App Router, TypeScript, Tailwind, Zod contracts, MapLibre GL.
- **Single source of truth for the status union:** [`lib/contracts/supercharger.ts`](lib/contracts/supercharger.ts) →
  `SuperchargerStatusSchema` (`z.enum`). Re-exported through [`lib/api.ts`](lib/api.ts) as
  `SuperchargerStatus`. **Every status type flows from this one enum** — changing it propagates types
  everywhere, and Zod parsing means any unrecognized status value **throws at parse time** (key risk).
- **Status presentation map:** [`lib/status.ts`](lib/status.ts) → `STATUS_CONFIG` (label, hex, dot, badge per status).
- **Sentence-case labels / transition text:** [`lib/supercharger-history-status.ts`](lib/supercharger-history-status.ts).
- **Consumers:** stats on home, list filter, map marker colors + legend + filter, status badge,
  charger detail (badge, hidden timeline), status-updates transitions.

---

## 2. Inventory — every usage of the old status values (file:line)

### A. Type / contract definitions (the root)

| File:line | What it does | Change |
|---|---|---|
| [`lib/contracts/supercharger.ts:3`](lib/contracts/supercharger.ts) | `SuperchargerStatusSchema = z.enum([IN_DEVELOPMENT, UNDER_CONSTRUCTION, UNKNOWN, OPENED, REMOVED])` | Replace with `PRELIMINARY, DESIGN, CONSTRUCTION, UNKNOWN, OPENED, REMOVED` |
| [`lib/contracts/stats.ts:6`](lib/contracts/stats.ts) | `by_status` keyed on the enum (`z.partialRecord`) | No edit needed — follows the enum automatically |
| [`lib/contracts/recent-changes.ts:9-11`](lib/contracts/recent-changes.ts) | `old_status`/`new_status` use the enum | No edit needed — follows the enum |

### B. Presentation config

| File:line | What it does | Change |
|---|---|---|
| [`lib/status.ts:7-12`](lib/status.ts) | `IN_DEVELOPMENT` config (label, hex `#00FF9F`, emerald dot/badge) | Split into `PRELIMINARY` + `DESIGN` (distinct labels & colors — see §4) |
| [`lib/status.ts:13-18`](lib/status.ts) | `UNDER_CONSTRUCTION` config (orange) | Rename key → `CONSTRUCTION`, keep orange |
| [`lib/status.ts:19-36`](lib/status.ts) | `OPENED` / `REMOVED` / `UNKNOWN` | Unchanged |

### C. Hardcoded status string references

| File:line | What it does | Change |
|---|---|---|
| [`app/(public)/page.tsx:15`](app/(public)/page.tsx) | `by_status["UNDER_CONSTRUCTION"]` stat | → `by_status["CONSTRUCTION"]` |
| [`app/(public)/page.tsx:16`](app/(public)/page.tsx) | `by_status["IN_DEVELOPMENT"]` stat | Re-decide the 3 home stats (see §4) |
| [`app/(public)/page.tsx:33-34`](app/(public)/page.tsx) | "under construction" / "in development" labels | Update labels to match new buckets |
| [`components/SuperchargerMapInner.tsx:66-73`](components/SuperchargerMapInner.tsx) | MapLibre `circle-color` match on `IN_DEVELOPMENT`/`UNDER_CONSTRUCTION`, fallback `UNKNOWN.hex` | Add `PRELIMINARY`, `DESIGN`, `CONSTRUCTION` arms |
| [`components/SuperchargerMapInner.tsx:160-167`](components/SuperchargerMapInner.tsx) | `LEGEND_ITEMS` (2 entries: Under Construction, In Development) | Expand to new buckets (see §4 for how many to show) |
| [`components/SuperchargerList.tsx:231-232`](components/SuperchargerList.tsx) | Filter `<option>`s `IN_DEVELOPMENT`/`UNDER_CONSTRUCTION` | Replace with `PRELIMINARY`/`DESIGN`/`CONSTRUCTION` |
| [`app/(public)/charger/[id]/page.tsx:53-69`](app/(public)/charger/[id]/page.tsx) | `PHASE_STEPS` timeline (`IN_DEVELOPMENT`, `UNDER_CONSTRUCTION`, `OPENED`) | Re-model to `PRELIMINARY → DESIGN → CONSTRUCTION → OPENED`. **Note: timeline currently disabled** (`showBuildoutTimeline = false`, line 76) but fix for correctness |
| [`app/(public)/charger/[id]/page.tsx:345`](app/(public)/charger/[id]/page.tsx) | `stepId === "IN_DEVELOPMENT"` start-date special-case | → first step (`PRELIMINARY`) |
| [`app/(public)/charger/[id]/page.tsx:387-393`](app/(public)/charger/[id]/page.tsx) | `getPhaseEmoji` typed union + emoji map | Add Preliminary/Design emojis, rename Construction |
| [`lib/supercharger-history-status.ts:8-10`](lib/supercharger-history-status.ts) | `sentenceCaseHistoryStatusLabel` switch cases | Replace `IN_DEVELOPMENT`/`UNDER_CONSTRUCTION` with `PRELIMINARY`/`DESIGN`/`CONSTRUCTION` |

### D. Tolerant-by-default (no hardcoded values, but affected)

| File:line | Behavior |
|---|---|
| [`components/StatusBadge.tsx:21`](components/StatusBadge.tsx) | Already falls back to `STATUS_CONFIG.UNKNOWN` for missing keys — **good**, tolerant |
| [`components/ChargerDetailMap.tsx:19`](components/ChargerDetailMap.tsx) | Same `?? STATUS_CONFIG.UNKNOWN` fallback — **good** |
| [`components/StatusUpdatesRows.tsx`](components/StatusUpdatesRows.tsx) | Renders whatever badges/labels the helpers produce — driven by enum + helpers, no hardcoded old values |
| [`app/api/superchargers/soon/route.ts:24`](app/api/superchargers/soon/route.ts) | Passes `status` filter through untouched — backend validates. No change |

**Total hardcoded edits: ~10 files.** The enum + `STATUS_CONFIG` are the hubs; everything else is
either a hardcoded reference list or already tolerant.

---

## 3. The breaking migration

- `IN_DEVELOPMENT` → **split** into `PRELIMINARY` (earliest) + `DESIGN`. Distinct labels/colors.
- `UNDER_CONSTRUCTION` → **rename** `CONSTRUCTION`.
- `UNKNOWN`, `OPENED`, `REMOVED` unchanged.
- Pipeline order everywhere: **`PRELIMINARY → DESIGN → CONSTRUCTION → OPENED`**.

The split is the only place needing genuinely new design (two buckets where there was one). The
rest is mechanical rename + adding arms to match expressions / option lists.

**Casing — all ALL-CAPS, uniform across every endpoint** (confirmed): `status`, `old_status`/
`new_status` (history + recent-changes), the stats `by_status` keys, and the `?status=` filter param
all use the SCREAMING_SNAKE set. Our shared `z.enum` is already this casing, so no per-endpoint
handling is needed. The backend's `validate_status` uppercases filter input, so the list filter
`<option value="PRELIMINARY">` (already uppercase) needs no client-side casing transform.

---

## 4. Status label / color mapping (new 6-value set)

**Temperature-ramp mapping** — the pipeline order maps to cool→warm, so the palette reads
left-to-right toward opening. Reuses the two existing colors (mint, orange) so the map/legend don't
visually churn; only `PRELIMINARY` introduces a new color.

| Status | Label (badge/legend/filter) | hex (map/dot) | Tailwind dot | Notes |
|---|---|---|---|---|
| `PRELIMINARY` | Preliminary Planning | `#38BDF8` (sky-400) | `bg-sky-400` | New stage; cool blue = earliest ("site picked / voted") |
| `DESIGN` | In Design | `#00FF9F` (existing mint) | `bg-emerald-400` | Inherits the old `IN_DEVELOPMENT` color → continuity |
| `CONSTRUCTION` | Under Construction | `#FF9500` (unchanged) | `bg-orange-500` | Was `UNDER_CONSTRUCTION` |
| `UNKNOWN` | Unknown | `#71717a` | `bg-zinc-500` | Unchanged. Stays in the enum; renders gray badge/dot. **Not** surfaced in filter/legend (as today) |
| `OPENED` | Opened | `#22c55e` | `bg-green-400` | Unchanged |
| `REMOVED` | Removed | `#f87171` | `bg-red-400` | Unchanged |

Labels **confirmed**. One check left before locking the palette (§6.4):
- **sky-400 vs map water/base tiles** — blue dots can blend with water. Fallback if so:
  violet/indigo `#A78BFA` for Preliminary (still reads "early/cool", no water clash).

**Sentence-case variants** (`lib/supercharger-history-status.ts`, used in history/transition copy):
"Preliminary planning", "In design", "Under construction".

**Home page stats — confirmed: stay at 3 slots.** Show **coming soon (total)**, **under construction
(`CONSTRUCTION`)**, and **in development (`PRELIMINARY + DESIGN` summed)**. Keeps the existing
hardcoded 3-col mobile grid ([`page.tsx:31`](app/(public)/page.tsx)) intact; the finer granularity
lives where it's actionable (list filter, map legend, detail). Trade-off accepted: the homepage
headline doesn't expose the Preliminary/Design split — fine for a hero surface.

**Map legend & list filter:** include all three active build stages
(Preliminary, Design, Under Construction). The list filter `<option>`s and map `LEGEND_ITEMS`
should both list the same three. (`status=UNKNOWN` is a valid backend filter but we don't expose it
today — leave as-is.)

---

## 5. Additive UI plan (exposed fields only — see §0)

New optional fields on `SuperchargerSchema` / `SuperchargerDetailSchema`:
- `num_charger_stalls: z.number()` (present on both list & detail per API.md)
- `charging_accessibility: z.string().nullable()`
- `raw_project_status: z.string().nullable()`

Make them **optional/nullable in the contract** (`.optional()`) so parsing stays tolerant if the
backend omits them on older records, and so the FE doesn't hard-break if a field lags.

| Field | Where to surface | Rule |
|---|---|---|
| `num_charger_stalls` | Charger **detail** header (a `SummaryItem`); optionally list card | **`0` ⇒ render "—"/hide, never "0 stalls".** Show e.g. "8 stalls" only when `> 0` |
| `charging_accessibility` | Charger **detail** (small labeled field or pill near the badge) | Show verbatim when non-null ("Tesla Only", etc.); hide when null |
| `raw_project_status` | Optional, detail only, de-emphasized | Informational; **never drive logic from it** — use canonical `status`. Could omit entirely |

- **Detail view** ([`app/(public)/charger/[id]/page.tsx`](app/(public)/charger/[id]/page.tsx)) is the
  obvious home — there's a `SummaryItem` component and a header area already.
- **List card** ([`components/SuperchargerCard.tsx`](components/SuperchargerCard.tsx)): stall count is
  a reasonable small addition under the location line; keep it subtle. Optional.
- **Map popups** ([`SuperchargerMapInner.tsx`](components/SuperchargerMapInner.tsx)): the map endpoint
  (`/superchargers/soon/map`) returns only id/title/lat/lng/status — **no additive fields**, so
  nothing to add there.
- **Out of scope:** structured address + `installed_full_power_kw` (not in API — §0).

Privacy/terms (`AGENTS.md` reminder): these fields are already-public Tesla data and don't change
data collection or guarantees, so **no privacy/terms update needed** — but double-check the "data
accuracy" wording if we surface stall counts prominently.

---

## 6. Risks & sequencing

1. **Hard breakage on mismatch (highest risk).** Zod `z.enum` parsing means once the backend emits
   `PRELIMINARY`/`DESIGN`/`CONSTRUCTION`, the **old** FE throws on *every* list/map/detail/recent-
   changes parse → error states everywhere. Conversely the **new** FE throws on old values. There is
   no overlap → **must deploy together**. Degradation differs by surface:
   - Home stats: `getStats().catch(() => null)` → shows "—". Soft-fails.
   - List / map / detail / status-updates: parse throw → existing error/`OverlayNotice` states. Hard-fails.
2. **Future-status resilience (planned).** This `z.enum` flip is a deliberate hard break for *this*
   migration. Separately, to guard against *future* status changes, apply `.catch("UNKNOWN")` to the
   per-charger `status` field (`z.enum(...).catch("UNKNOWN")`) — an unrecognized value then renders as
   an "Unknown" badge instead of throwing and blanking the whole list/map/detail page. `STATUS_CONFIG`
   and the label helper already fall back to UNKNOWN, so the rendering layer is ready. Apply only to
   `status` (not stats keys), and **`console.warn` in the catch** so genuine contract drift still gets
   logged rather than silently masked.
3. **One-time `PRELIMINARY → DESIGN` burst** in `/status-updates` on deploy day — expected, no action.
   The transition renderer already handles arbitrary old→new pairs.
4. **Color accessibility:** sky-400 (Preliminary) vs emerald-400 (Design) vs green-400 (Opened) —
   verify the blue/two-greens are distinguishable on the dark map background; fall back to violet
   `#A78BFA` for Preliminary if sky-400 blends with water tiles (§4).

---

## 7. Ordered task list (rough effort)

1. **Enum swap** in `lib/contracts/supercharger.ts` (+ `.catch("UNKNOWN")` resilience on `status` with `console.warn`). _S_ — unblocks types.
2. **`STATUS_CONFIG`** in `lib/status.ts`: split Preliminary (sky-400) / Design (mint), rename Construction. _S_
3. **Label helper** `lib/supercharger-history-status.ts`: new switch cases. _XS_
4. **Map** `SuperchargerMapInner.tsx`: `circle-color` arms + `LEGEND_ITEMS`. _S_
5. **List filter** `SuperchargerList.tsx`: option list. _XS_
6. **Home stats** `app/(public)/page.tsx`: `CONSTRUCTION` key + `PRELIMINARY + DESIGN` sum, labels. _S_
7. **Charger detail** `charger/[id]/page.tsx`: `PHASE_STEPS`, `getPhaseEmoji`, first-step special-case. _M_ (timeline currently disabled, but do it for correctness).
8. **Additive contract fields** (`num_charger_stalls`, `charging_accessibility`, `raw_project_status`) as optional/nullable. _S_
9. **Additive UI**: stall count + accessibility on detail (and optionally card), with `0 ⇒ —` rule. _M_
10. **Verify:** `npm run lint` + `npm run build`; smoke-test list/map/detail/status-updates/home against new-shape API. _S_

**Total: ~1 focused day**, dominated by the detail-page timeline (7) and additive UI (9). The
breaking enum migration itself is small and centralized.

---

## 8. Decisions & remaining questions

**Confirmed:**
- Hard break / lockstep deploy — accepted. (§6.1)
- Home page stays 3 stats; "in development" = `PRELIMINARY + DESIGN` summed. (§4)
- `.catch("UNKNOWN")` resilience on `status` with logging — yes. (§6.2)
- Structured address + `installed_full_power_kw` — **not exposed, fully out of scope**. (§0)
- Labels: PRELIMINARY = "Preliminary Planning", DESIGN = "In Design", CONSTRUCTION = "Under Construction". (§4)
- `UNKNOWN` stays in the enum; gray badge/dot; not surfaced in filter/legend. (§4)

**Still open (non-blocking, can lock during implementation):**
1. Preliminary color — sky-400 `#38BDF8`, pending the water-tile contrast check; violet `#A78BFA` fallback. (§4, §6.4)
