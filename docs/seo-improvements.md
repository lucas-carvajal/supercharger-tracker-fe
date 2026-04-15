# SEO Improvements for Soonercharger

> Research & recommendations for ranking on Google and in AI-powered answer engines (ChatGPT, Perplexity, Claude, Gemini).

**Audit date:** April 2026  
**Framework:** Next.js 16.2.1 (App Router)  
**Current live pages:** `/` (home), `/map`, `/charger/[id]`

---

## Current State Audit

### What exists

| Item | Status | Notes |
|---|---|---|
| Root `<title>` & `<meta description>` | ✅ | `app/layout.tsx` — basic only |
| `lang="en"` on `<html>` | ✅ | Hard-coded in root layout |
| Semantic heading hierarchy (H1 → H2) | ✅ | Present on all pages |
| Favicon (`.ico`) | ✅ | Only ICO format, no PNG/WebP variants |
| Loading & 404 states | ✅ | `loading.tsx`, `not-found.tsx` |

### What's missing

| Item | Priority | Status |
|---|---|---|
| `generateMetadata` on `/charger/[id]` | 🔴 Critical | ✅ Done |
| Open Graph tags (`og:*`) | 🔴 Critical | ✅ Done (no image yet) |
| Twitter Card tags | 🔴 Critical | ✅ Done (`summary`, no image) |
| `sitemap.ts` | 🔴 Critical | ✅ Done |
| `robots.ts` | 🔴 Critical | ✅ Done |
| JSON-LD structured data | 🔴 Critical | ✅ Partial — `WebSite` + `BreadcrumbList` done; rest skipped |
| Canonical URL (`metadataBase`) | 🟠 High | ✅ Done |
| Per-page metadata for `/map` | 🟠 High | ✅ Done |
| Multiple favicon formats | 🟡 Medium | ⏳ Tracked in `docs/todo-mobile-icons.md` |
| OG image | 🟡 Medium | ⏳ Skipped — needs design work |
| `llms.txt` | 🟡 Medium | ⏳ Skipped — crawlers don't read it yet |
| `manifest.json` | 🟢 Low | ⏳ Tracked in `docs/todo-mobile-icons.md` |

---

## SEO Improvements (Traditional)

### 1. ✅ Set `metadataBase` in the root layout

`metadataBase` set to `process.env.SITE_URL ?? "https://soonercharger.com"` with title template `"%s | Soonercharger"`.

---

### 2. ✅ Open Graph + Twitter Card tags in the root layout

`og:type`, `og:siteName` added. Twitter Card set to `summary`.

**Still outstanding:** `og:image` + `twitter:image` — needs a 1200×630 design asset. When ready, upgrade Twitter Card to `summary_large_image`.

---

### 3. ✅ `generateMetadata` for `/charger/[id]`

Each charger page has a unique title (`Austin, TX | Soonercharger`), description (`Supercharger in Austin, TX is under construction...`), `og:url`, and `alternates.canonical`.

---

### 4. ✅ Per-page metadata for `/map`

Title, description, `og:title`, `og:description`, `og:url`, and canonical set in `app/map/page.tsx`.

---

### 5. ✅ Dynamic `sitemap.ts`

`app/sitemap.ts` generates `/sitemap.xml` with static routes (home, map) and all active charger pages. Uses `last_scraped_at` as `lastModified`. Base URL reads from `SITE_URL` env var.

> **Note:** If the charger count grows very large (> 50 000 URLs), split into multiple sitemaps using `generateSitemaps()`.

---

### 6. ✅ `robots.ts`

`app/robots.ts` allows all crawlers (`*`) and points to `/sitemap.xml`. Base URL reads from `SITE_URL` env var.

---

### 7. ✅ / ⏳ JSON-LD structured data

**Done:**
- `WebSite` schema in root layout
- `BreadcrumbList` on charger detail pages (shows `Home › Austin Downtown` in Google results)

**Skipped for now:**
- `Organization` — more relevant once social/brand presence exists
- `Place` — lower priority, Google gets coordinates from the map embed
- `FAQPage` — only relevant if a FAQ section is added to the home page
- `Dataset` — niche signal, low priority

---

### 8. ⏳ Favicon improvements

Tracked in `docs/todo-mobile-icons.md`. Needs image assets created first.

| File | Size | Status |
|---|---|---|
| `app/favicon.ico` | 16+32 px | ✅ Exists |
| `app/icon.png` | 32×32 | ⏳ |
| `app/apple-icon.png` | 180×180 | ⏳ |
| `public/icon-192.png` | 192×192 | ⏳ |
| `public/icon-512.png` | 512×512 | ⏳ |

---

### 9. ⏳ OG image

Needs a 1200×630 PNG design asset. Once available:
- Add to `public/og-image.png`
- Add `images` to `openGraph` in root layout
- Upgrade Twitter Card to `summary_large_image`

Can also be generated dynamically via `app/opengraph-image.tsx` using Next.js `ImageResponse`.

---

### 10. ✅ Canonical URL on every page

Covered by `metadataBase` in the root layout. Dynamic pages (`/charger/[id]`, `/map`) also have explicit `alternates.canonical`.

---

## AI & Agent SEO (GEO / AEO)

### 11. ⏳ `llms.txt`

Skipped — none of the major AI crawlers (GPTBot, ClaudeBot, PerplexityBot) currently read it. Low priority until adoption improves.

---

### 12. ✅ `robots.ts` — AI crawlers allowed

`userAgent: "*"` covers all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.).

---

### 13. ⏳ Content structure for AI citations

Not yet done. Potential improvements:

- **Lead with the answer** on charger detail pages — add a brief prose summary near the top with the charger name, location, and status in plain text
- **Descriptive headings** — "Buildout progress" → "Austin Downtown Supercharger Build Timeline"
- **FAQ section** on home page — dramatically increases AI citation probability (also enables `FAQPage` JSON-LD)

---

### 14. ⏳ `Organization` JSON-LD

Skipped for now. More relevant once social profile URLs exist to add to `sameAs`.

---

### 15. ⏳ `Dataset` schema

Skipped. Low priority.

---

## Core Web Vitals & Performance

### 16. ⏳ `theme-color` meta

Not yet added. One-liner in root layout:

```ts
// app/layout.tsx
themeColor: "#ff9500",
```

### 17. ⏳ ISR caching for charger list

`getSuperchargersSoon` currently uses `cache: "no-store"`. Switching to `revalidate: 60` would cache the charger list at the CDN edge, improving LCP:

```ts
// lib/api.ts
return fetch(url, { next: { revalidate: 60 } });
```

### 18. ⏳ `next/image` for future images

No images on the site yet. When added, always use `next/image` with explicit `width`/`height` and `priority` on above-the-fold images to prevent CLS.

---

## Implementation Priority

| # | Task | Effort | Status |
|---|---|---|---|
| 1 | `metadataBase` + title template | 5 min | ✅ Done |
| 2 | OG + Twitter card tags | 10 min | ✅ Done (no image) |
| 3 | `generateMetadata` for `/charger/[id]` | 20 min | ✅ Done |
| 4 | Metadata for `/map` | 5 min | ✅ Done |
| 5 | `robots.ts` | 5 min | ✅ Done |
| 6 | `sitemap.ts` | 30 min | ✅ Done |
| 7 | JSON-LD: `WebSite` + `BreadcrumbList` | 15 min | ✅ Done |
| 8 | OG image (`/public/og-image.png`) | 30 min | ⏳ Needs design asset |
| 9 | Favicon PNG variants + apple-icon | 15 min | ⏳ Needs design asset |
| 10 | `manifest.ts` | 10 min | ⏳ Blocked on favicon assets |
| 11 | `theme-color` meta | 2 min | ⏳ Quick win |
| 12 | ISR caching (`revalidate: 60`) | 10 min | ⏳ |
| 13 | FAQ section + `FAQPage` JSON-LD on home | 45 min | ⏳ Content decision first |
| 14 | `llms.txt` | 15 min | ⏳ Low priority |
| 15 | JSON-LD: `Organization`, `Place`, `Dataset` | 20 min | ⏳ Low priority |

---

## References

- [Next.js — Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js — JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js — `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js — `robots.txt`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js — `generateSitemaps`](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)
- [Search Engine Land — Technical SEO for generative search](https://searchengineland.com/technical-seo-generative-search-optimizing-ai-agents-473039)
- [Search Engine Land — Mastering GEO in 2026](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142)
- [Powered by Search — AEO & LLM SEO best practices](https://www.poweredbysearch.com/blog/aeo-llm-seo-best-practices/)
- [eMarketer — FAQ on GEO and AEO in 2026](https://www.emarketer.com/content/faq-on-geo-aeo--where-ai-search-seo-overlap-2026)
- [Foundation Inc — Complete GEO Guide](https://foundationinc.co/lab/generative-engine-optimization)
- [Neil Patel — What is llms.txt?](https://neilpatel.com/blog/llms-txt-files-for-seo/)
- [Goodie — llms.txt & robots.txt for AI bots](https://higoodie.com/blog/llms-txt-robots-txt-ai-optimization/)
- [VentureBeat — LLM-referred traffic converts at 30–40%](https://venturebeat.com/technology/llm-referred-traffic-converts-at-30-40-and-most-enterprises-arent-optimizing)
- [schema.org — Place](https://schema.org/Place)
- [schema.org — Dataset](https://schema.org/Dataset)
- [schema.org — FAQPage](https://schema.org/FAQPage)
