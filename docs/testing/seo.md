# Testing SEO

How to verify the SEO work in [../seo.md](../seo.md) actually works. Meant to be run after a deploy (or against a local dev server) in ~10 minutes.

---

## 1. Metadata & social previews

**Locally:** view-source on `/`, `/map`, and a `/charger/{id}` page. Confirm each has a unique `<title>`, `<meta name="description">`, `og:*` tags, and `twitter:card`. For a charger page, the title and description should reflect *that specific charger* (location + status), not a generic fallback.

**In production:** paste a URL into [opengraph.xyz](https://www.opengraph.xyz/) to see the actual rendered preview for social platforms.

## 2. Canonical URLs

View source on `/map` and a charger page — confirm `<link rel="canonical" href="...">` is present and absolute.

Then hit the same charger with a junk query string (e.g. `/charger/123?ref=foo`) and confirm the canonical still points at the clean URL.

## 3. Sitemap

Visit `/sitemap.xml`:

- `/`, `/map`, and a bunch of `/charger/{id}` entries should be present.
- Spot-check that `lastmod` on charger entries looks recent and URLs use the correct domain.

Test the fallback: point the API at a bad URL locally and confirm the sitemap still returns the static routes without crashing.

## 4. Robots

Visit `/robots.txt` — should show `User-agent: *` / `Allow: /` and reference `${SITE_URL}/sitemap.xml`.

## 5. Structured data (JSON-LD)

**Quick:** view-source and confirm the `<script type="application/ld+json">` blocks — `WebSite` on every page, `BreadcrumbList` on charger detail pages.

**Validation:** paste a production URL into [Google's Rich Results Test](https://search.google.com/test/rich-results) or the [Schema.org Validator](https://validator.schema.org/). Both should parse the JSON without errors and list the detected schema types.

## 6. Favicon

Visit `/favicon.ico` directly — should serve the file. Check the browser tab shows it on the home page.

## 7. Lighthouse SEO audit

Chrome DevTools → Lighthouse → SEO category, against a production URL in an incognito window. Aim for 100 — it'll catch anything the checks above missed.

---

## Quick smoke test

For a fast check of the machine-readable endpoints:

```bash
curl -s https://soonercharger.com/robots.txt
curl -s https://soonercharger.com/sitemap.xml | head -50
curl -s https://soonercharger.com/ | grep -E '<(title|meta|link rel="canonical")'
```
