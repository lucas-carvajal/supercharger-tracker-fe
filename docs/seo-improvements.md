# SEO Improvements — Outstanding Items

**Last updated:** April 2026

---

## FAQ section + `FAQPage` JSON-LD

Add a short FAQ to the home page — high-value AI citation signal. Once the copy exists, add `FAQPage` JSON-LD alongside it.

Suggested questions:
- What is Soonercharger?
- How often is the data updated?
- What does "in development" mean?
- What does "under construction" mean?

---

## Core Web Vitals

Don't optimise blind — deploy to production, then measure.

**How to measure:**
- Lighthouse audit in Chrome DevTools (incognito, production URL)
- Google Search Console → Experience → Core Web Vitals (after a few weeks of traffic)

**Google's 2026 thresholds:**

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| INP (Interaction to Next Paint) | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

**Likely fixes if metrics are poor:**
- LCP: `priority` prop on above-the-fold images via `next/image`
- CLS: explicit `width`/`height` on all images
- INP: profile map interactions (panning/clicking is the main candidate)
