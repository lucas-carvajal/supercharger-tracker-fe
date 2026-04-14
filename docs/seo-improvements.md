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

| Item | Priority | Impact |
|---|---|---|
| `generateMetadata` on `/charger/[id]` | 🔴 Critical | Each charger page uses the generic root title |
| Open Graph tags (`og:*`) | 🔴 Critical | No link previews on Slack, Twitter, iMessage, etc. |
| Twitter Card tags | 🔴 Critical | No social preview cards |
| `sitemap.ts` | 🔴 Critical | Google can't discover charger pages |
| `robots.ts` | 🔴 Critical | No crawl directives, AI bots not explicitly allowed |
| JSON-LD structured data | 🔴 Critical | No rich snippets, poor AI comprehension |
| Canonical URL (`metadataBase`) | 🟠 High | No absolute URL anchor for Open Graph / canonical tags |
| Per-page metadata for `/map` | 🟠 High | Inherits generic root title |
| Multiple favicon formats | 🟡 Medium | Apple touch icon, 192 × 192 PNG missing |
| OG image | 🟡 Medium | No preview image for social sharing |
| `llms.txt` | 🟡 Medium | AI crawlers lack a machine-readable site guide |
| `manifest.json` | 🟢 Low | PWA installability, minor SEO signal |

---

## SEO Improvements (Traditional)

### 1. Set `metadataBase` in the root layout

All relative Open Graph and canonical URLs resolve against this base. Without it, Next.js logs a warning and social previews break.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://soonercharger.com"),
  title: {
    default: "Soonercharger",
    template: "%s | Soonercharger",
  },
  description:
    "Track every Tesla Supercharger in development, under construction, or coming soon — updated in real time.",
};
```

`template: "%s | Soonercharger"` means child-page titles automatically append the brand name, so `/charger/[id]` pages get titles like `Austin Downtown | Soonercharger`.

---

### 2. Open Graph + Twitter Card tags in the root layout

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://soonercharger.com"),
  title: {
    default: "Soonercharger",
    template: "%s | Soonercharger",
  },
  description:
    "Track every Tesla Supercharger in development, under construction, or coming soon — updated in real time.",
  openGraph: {
    type: "website",
    siteName: "Soonercharger",
    title: "Soonercharger",
    description:
      "Track every Tesla Supercharger in development, under construction, or coming soon — updated in real time.",
    url: "https://soonercharger.com",
    images: [
      {
        url: "/og-image.png", // 1200 × 630 px
        width: 1200,
        height: 630,
        alt: "Soonercharger – Tesla Supercharger Buildout Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soonercharger",
    description:
      "Track every Tesla Supercharger in development, under construction, or coming soon.",
    images: ["/og-image.png"],
  },
};
```

**Action:** create `/public/og-image.png` (1200 × 630 px). Can be a static branded image or generated dynamically via `app/opengraph-image.tsx` using Next.js `ImageResponse`.

---

### 3. `generateMetadata` for `/charger/[id]`

Each charger needs a unique title, description, and Open Graph entry. Next.js supports a `generateMetadata` async function that receives the same `params` as the page — so the same `getSupercharger(id)` fetch is reused (Next.js deduplicates server-side fetches automatically).

```ts
// app/charger/[id]/page.tsx  – add above the page component

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: ChargerPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const charger = await getSupercharger(id);
    const statusLabel =
      charger.status === "UNDER_CONSTRUCTION"
        ? "under construction"
        : charger.status === "IN_DEVELOPMENT"
          ? "in development"
          : "coming soon";
    const location = [charger.city, charger.region].filter(Boolean).join(", ");

    return {
      title: charger.title,
      description: `${charger.title}${location ? ` in ${location}` : ""} is ${statusLabel}. Track its buildout progress on Soonercharger.`,
      openGraph: {
        title: charger.title,
        description: `${charger.title} is ${statusLabel}. Follow its buildout progress on Soonercharger.`,
        url: `/charger/${id}`,
      },
    };
  } catch {
    return {
      title: "Supercharger Details",
    };
  }
}
```

---

### 4. Per-page metadata for `/map`

```ts
// app/map/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Interactive map of every Tesla Supercharger coming soon, under construction, or in development across the globe.",
  openGraph: {
    title: "Soonercharger Map",
    description:
      "Explore all upcoming Tesla Supercharger locations on an interactive map.",
    url: "/map",
  },
};
```

---

### 5. Dynamic `sitemap.ts`

A sitemap tells Google which pages to crawl and when they were last modified. Without one, the individual `/charger/[id]` pages may never be indexed.

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getSuperchargersSoon } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://soonercharger.com";

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  // Dynamic charger pages
  try {
    const { items } = await getSuperchargersSoon(1000); // fetch all
    const chargerRoutes: MetadataRoute.Sitemap = items.map((charger) => ({
      url: `${baseUrl}/charger/${charger.id}`,
      lastModified: new Date(charger.last_scraped_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...chargerRoutes];
  } catch {
    return staticRoutes;
  }
}
```

> **Note:** If the charger count grows very large (> 50 000 URLs), split into multiple sitemaps using `generateSitemaps()`.

---

### 6. `robots.ts`

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://soonercharger.com/sitemap.xml",
  };
}
```

This explicitly allows all crawlers and points them at the sitemap.

---

### 7. JSON-LD structured data

Structured data is the single biggest lever for appearing in rich results and for being cited by AI answer engines (ChatGPT, Perplexity, Gemini). Add it as a `<script type="application/ld+json">` in the relevant pages.

#### Root layout — WebSite + SearchAction

```tsx
// app/layout.tsx  – inside <body>, before {children}
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Soonercharger",
  url: "https://soonercharger.com",
  description:
    "Track every Tesla Supercharger in development, under construction, or coming soon.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://soonercharger.com/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// In the JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
/>
```

#### Home page — ItemList of chargers

```tsx
// app/page.tsx  – after fetching data
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Tesla Superchargers Coming Soon",
  description:
    "A live list of Tesla Supercharger stations in development or under construction.",
  url: "https://soonercharger.com",
  numberOfItems: data.total,
  itemListElement: data.items.slice(0, 20).map((charger, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `https://soonercharger.com/charger/${charger.id}`,
    name: charger.title,
  })),
};
```

#### Charger detail page — Place + BreadcrumbList

```tsx
// app/charger/[id]/page.tsx  – after fetching charger data
const placeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Place",
  name: charger.title,
  description: `Tesla Supercharger ${charger.title} is currently ${formatStatusLabel(charger.status).toLowerCase()}.`,
  url: `https://soonercharger.com/charger/${charger.id}`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: charger.latitude,
    longitude: charger.longitude,
  },
  sameAs: charger.tesla_url,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://soonercharger.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: charger.title,
      item: `https://soonercharger.com/charger/${charger.id}`,
    },
  ],
};
```

---

### 8. Favicon improvements

Next.js 13+ supports the following special files inside `app/`:

| File | Purpose |
|---|---|
| `app/favicon.ico` | Already exists |
| `app/icon.png` | 32 × 32 PNG fallback |
| `app/apple-icon.png` | 180 × 180 Apple touch icon |
| `public/favicon-192.png` | PWA manifest icon |
| `public/favicon-512.png` | PWA manifest icon |

Add `apple-icon.png` and `icon.png` to `app/` and Next.js will automatically generate the correct `<link rel="apple-touch-icon">` tags.

---

### 9. `manifest.json` (PWA basics)

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Soonercharger",
    short_name: "Soonercharger",
    description:
      "Track Tesla Supercharger buildout progress in real time.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff9500",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

---

### 10. Canonical URL on every page

`metadataBase` (added in step 1) is sufficient for Next.js to auto-generate canonical tags. But for dynamic pages, explicitly pass `alternates.canonical` in `generateMetadata`:

```ts
// in generateMetadata for /charger/[id]
alternates: {
  canonical: `/charger/${id}`,
},
```

---

## AI & Agent SEO (GEO / AEO)

> In 2026, a growing fraction of discovery happens through AI answer engines (ChatGPT Search, Perplexity, Gemini, Claude). These are called **Generative Engine Optimization (GEO)** and **Answer Engine Optimization (AEO)** signals. They complement — not replace — traditional SEO.

### 11. `llms.txt`

`llms.txt` is a Markdown file at the root of the site that gives AI systems a concise, machine-readable overview of the site's structure and key content. It was proposed by Jeremy Howard in late 2024 and adoption is growing.

```md
# Soonercharger

> Soonercharger tracks every Tesla Supercharger station currently in development, under construction, or coming soon — updated in real time by scraping Tesla's official charger map.

## What this site does

- Lists all upcoming Tesla Supercharger locations with their current build status
- Provides a filterable, searchable list and an interactive map
- Tracks status transitions: In Development → Under Construction → Opened

## Key pages

- [Home – full list of coming-soon chargers](https://soonercharger.com/)
- [Interactive map](https://soonercharger.com/map)
- [Individual charger detail pages](https://soonercharger.com/charger/{id})

## Data freshness

Data is scraped from Tesla's official Supercharger pages and refreshed continuously. Each charger page shows the date it was first seen and how long it has been in its current status.

## Optional: llms-full.txt

For the full machine-readable index of all charger locations, see /llms-full.txt
```

Save as `public/llms.txt` — it will be served at `https://soonercharger.com/llms.txt`.

Optionally create a `public/llms-full.txt` that includes a Markdown list of every charger URL and its title/status for AI training/indexing purposes.

---

### 12. `robots.ts` — explicitly allow AI crawlers

Major AI crawlers use distinct user-agent strings. Explicitly allowing them (or not blocking them) signals openness to AI indexing:

| Crawler | User-Agent | Org |
|---|---|---|
| GPTBot | `GPTBot` | OpenAI |
| ChatGPT-User | `ChatGPT-User` | OpenAI |
| ClaudeBot | `ClaudeBot` | Anthropic |
| PerplexityBot | `PerplexityBot` | Perplexity AI |
| Googlebot | `Googlebot` | Google |
| Bingbot | `bingbot` | Microsoft |

The `robots.ts` in step 6 uses `userAgent: "*"` which already covers all of these. If there's ever a need to restrict access (e.g. block training), target specific bots rather than `*`.

---

### 13. Content structure for AI citations

AI engines quote pages that are structured, factual, and answer-shaped. Apply these content principles:

**Lead with the answer.** The first 100 words of every page should state the most important fact. For the home page this is already good ("Track the expansion of the world's biggest charging network in real time"). For charger detail pages, consider adding a brief prose summary near the top:

```
Austin Downtown Tesla Supercharger is currently under construction in Austin, TX.
It was first tracked on Jan 15, 2025 and has been under construction for 92 days.
```

**Use descriptive headings.** Headings like "Buildout progress" and "Find it on the map" are fine UX but weak for AI citation. More descriptive alternatives: "Austin Downtown Supercharger Build Timeline" and "Austin Downtown Supercharger Location Map".

**FAQ-style content.** AI engines heavily favour FAQ-structured content because it maps directly to question → answer format. A small FAQ section on the home page could dramatically increase AI citation probability:

```md
## Frequently asked questions

### What is Soonercharger?
Soonercharger is a real-time tracker for Tesla Supercharger stations that are
in development, under construction, or coming soon. It aggregates data from
Tesla's official charger listings.

### How often is the data updated?
The site scrapes Tesla's official Supercharger pages continuously and reflects
the latest known status for each location.

### What does "in development" mean?
"In development" means Tesla has published a listing for the Supercharger
location but construction has not yet started. This phase typically lasts
several months to over a year.

### What does "under construction" mean?
"Under construction" means physical construction of the Supercharger site is
actively underway.
```

Add `FAQPage` JSON-LD alongside these questions for rich snippet eligibility:

```ts
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Soonercharger?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Soonercharger is a real-time tracker for Tesla Supercharger stations that are in development, under construction, or coming soon.",
      },
    },
    // ... more Q&As
  ],
};
```

---

### 14. `Organization` JSON-LD in root layout

AI engines use `Organization` schema to build an authoritative entity graph for the site. Add this alongside the `WebSite` schema:

```ts
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Soonercharger",
  url: "https://soonercharger.com",
  description:
    "Real-time tracker for upcoming Tesla Supercharger stations worldwide.",
  sameAs: [
    // Add official social/profile URLs if they exist
  ],
};
```

---

### 15. `Dataset` schema for the data-driven nature of the site

Since Soonercharger is fundamentally a data product, `Dataset` schema is a strong fit and helps AI agents understand the site as an authoritative data source:

```ts
const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Tesla Supercharger Buildout Tracker",
  description:
    "A continuously updated dataset of Tesla Supercharger stations that are in development, under construction, or coming soon, scraped from Tesla's official listings.",
  url: "https://soonercharger.com",
  creator: {
    "@type": "Organization",
    name: "Soonercharger",
  },
  temporalCoverage: "2024/..",
  spatialCoverage: {
    "@type": "Place",
    name: "Worldwide",
  },
  variableMeasured: ["Supercharger status", "Construction timeline", "Geographic location"],
};
```

---

## Core Web Vitals & Performance

Search engine ranking (and therefore AI citation eligibility) is tied to Core Web Vitals. Google's 2026 thresholds:

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| INP (Interaction to Next Paint) | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

### 16. Add `<meta name="theme-color">` and viewport meta

Next.js sets the viewport meta automatically, but `theme-color` is not:

```ts
// app/layout.tsx
export const metadata: Metadata = {
  // ...existing
  themeColor: "#ff9500", // Tesla orange
};
```

### 17. Prefetch critical charger data

The charger list is fetched on every page load with `cache: "no-store"`. For the list page, consider using `revalidate` instead so the response is cached at the CDN edge:

```ts
// lib/api.ts  – for getSuperchargersSoon
return fetch(url, { next: { revalidate: 60 } }); // 60-second ISR
```

This reduces TTFB for the largest content element (the charger list), directly improving LCP.

### 18. `next/image` for the OG image and any future illustrations

If images are added to the site, always use `next/image` with explicit `width` and `height` to prevent CLS. Add `priority` to above-the-fold images.

---

## Implementation Priority

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | `metadataBase` + title template in root layout | 5 min | 🔴 Unblocks all OG/canonical tags |
| 2 | OG + Twitter card tags in root layout | 10 min | 🔴 Social previews everywhere |
| 3 | `generateMetadata` for `/charger/[id]` | 20 min | 🔴 Unique titles per charger = indexable pages |
| 4 | Metadata for `/map` | 5 min | 🟠 |
| 5 | `robots.ts` | 5 min | 🔴 Crawl directives + sitemap pointer |
| 6 | `sitemap.ts` | 30 min | 🔴 Google discovers all charger pages |
| 7 | JSON-LD: `WebSite` + `Organization` in layout | 15 min | 🟠 Entity graph for AI engines |
| 8 | JSON-LD: `Place` + `BreadcrumbList` in charger detail | 20 min | 🟠 Rich snippets + AI citations |
| 9 | OG image (`/public/og-image.png`) | 30 min | 🟡 |
| 10 | `llms.txt` | 15 min | 🟡 AI crawler guidance |
| 11 | FAQ section + `FAQPage` JSON-LD on home | 45 min | 🟡 AI citation boost |
| 12 | JSON-LD: `Dataset` on home | 10 min | 🟡 Data-source authority signal |
| 13 | Favicon PNG variants + apple-icon | 15 min | 🟢 |
| 14 | `manifest.ts` | 10 min | 🟢 |
| 15 | ISR caching for charger list (`revalidate: 60`) | 10 min | 🟡 LCP improvement |

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
