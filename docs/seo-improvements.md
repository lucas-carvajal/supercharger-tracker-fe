# SEO Improvements for Soonercharger — Outstanding Items

> Everything listed here is still to be done. Completed items have been removed.

**Last updated:** April 2026

---

## Blocked on design assets

All three unblock at once once a proper logo/brand asset (512×512 PNG or SVG) is produced.

### OG image

Needs a 1200×630 PNG. Once available:
- Add to `public/og-image.png`
- Add `images` to `openGraph` in `app/layout.tsx`
- Upgrade Twitter Card from `summary` to `summary_large_image`

Can also be generated dynamically via `app/opengraph-image.tsx` using Next.js `ImageResponse`.

### Favicon PNG variants + apple-icon

See `docs/todo-mobile-icons.md` for the full implementation checklist.

| File | Size |
|---|---|
| `app/icon.png` | 32×32 |
| `app/apple-icon.png` | 180×180 |
| `public/icon-192.png` | 192×192 |
| `public/icon-512.png` | 512×512 |

### `manifest.ts`

Blocked on the favicon PNGs above. Implementation is already written in `docs/todo-mobile-icons.md`.

---

## Content decisions

### FAQ section + `FAQPage` JSON-LD

Write a short FAQ on the home page — this is a high-value AI citation signal. Once the copy exists, add `FAQPage` JSON-LD alongside it.

Suggested questions:
- What is Soonercharger?
- How often is the data updated?
- What does "in development" mean?
- What does "under construction" mean?

---

## Measure first, then decide

### Core Web Vitals

Don't optimise blind — deploy to production, then measure.

**How to measure:**
- Run a Lighthouse audit in Chrome DevTools (incognito, production URL)
- Check Google Search Console → Experience → Core Web Vitals after a few weeks of traffic

**Google's 2026 thresholds:**

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| INP (Interaction to Next Paint) | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

**Likely fixes if metrics are poor:**
- LCP: add `priority` prop to above-the-fold images via `next/image`
- CLS: ensure all images have explicit `width` and `height`
- INP: profile client-side interactions (map panning/clicking is the main candidate)

---

## Low priority / skipped

- **`llms.txt`** — AI crawlers don't read it yet. Revisit in 6–12 months.
- **`Organization`, `Place`, `Dataset` JSON-LD** — marginal gains on top of what's already implemented.

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
- [schema.org — FAQPage](https://schema.org/FAQPage)
