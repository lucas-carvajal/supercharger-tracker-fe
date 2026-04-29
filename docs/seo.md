# SEO

An overview of the SEO work on Soonercharger — what's in place, how it works, and why it matters. For outstanding items, see [plans/seo-improvements.md](plans/seo-improvements.md).

---

## Metadata & social previews

The root layout ([app/layout.tsx](../app/layout.tsx)) sets the site-wide defaults: title template, description, OpenGraph, Twitter card, and theme color. Every page inherits these and can override what it needs.

The map page ([app/map/page.tsx](../app/map/page.tsx)) and the charger detail page ([app/charger/[id]/page.tsx](../app/charger/[id]/page.tsx)) set their own titles and descriptions — the charger page builds them dynamically from the charger's location and current status, so every charger ends up with a unique, relevant preview when shared or shown in search results.

**Why it matters:** good metadata is what makes search result snippets and social link previews look like something you'd actually click.

## Canonical URLs

Both the map page and each charger detail page declare a canonical URL via `alternates.canonical`.

**Why it matters:** prevents Google from treating the same page under different query strings or paths as duplicate content.

## Sitemap

[app/sitemap.ts](../app/sitemap.ts) generates `/sitemap.xml` dynamically. It includes the home page, the map page, and every charger page (pulled from the API). Each entry gets a sensible priority and change frequency, and charger entries use `last_scraped_at` as the last-modified date so Google knows when something actually changed.

**Why it matters:** a charger page is not linked from the home page, so without a sitemap Google would struggle to discover them. The sitemap gives every charger a direct path to the index.

## Robots

[app/robots.ts](../app/robots.ts) generates `/robots.txt`, allows crawlers for the public site, disallows `/admin`, and points them at the sitemap.

**Why it matters:** it's the first file a crawler looks at — telling it where the sitemap lives speeds up discovery of new pages.

## Structured data (JSON-LD)

Two schemas are injected:

- **`WebSite`** on public pages via the public layout — tells search engines the site's identity (name, URL, description).
- **`BreadcrumbList`** on each charger detail page — a two-level `Home → {charger}` breadcrumb.

**Why it matters:** structured data unlocks enhanced search features. `WebSite` is a prerequisite for Google sitelinks; `BreadcrumbList` makes Google show a hierarchy in results instead of the raw URL, which usually improves click-through.

## Favicon

[app/favicon.ico](../app/favicon.ico) is auto-discovered by Next.js from the `app/` directory. Shows up in browser tabs, bookmarks, and search result rows.

---

## `SITE_URL` env var

The root metadata, sitemap, robots, public `WebSite` JSON-LD, and breadcrumb JSON-LD all read `process.env.SITE_URL`, defaulting to `https://soonercharger.com`. If the canonical domain ever changes, set this in the deployment environment and everything stays consistent.
