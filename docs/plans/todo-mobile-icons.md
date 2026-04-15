# TODO: Icons, favicons & brand images

Everything here is blocked on having a proper Soonercharger logo asset first.

## 1. Create the source asset

Design a logo and export it as a **512×512 PNG** (or SVG). This is the single source of truth for all sizes below.

## 2. Generate all icon sizes

Use [RealFaviconGenerator](https://realfavicongenerator.net) or [Favicon.io](https://favicon.io) to export all sizes at once from the source asset.

| File | Size | Purpose | Where |
|---|---|---|---|
| `favicon.ico` | 16+32 px (multi-size) | Browser tab (legacy) | `app/` — regenerate from new logo |
| `icon.png` | 32×32 | Browser tab (modern) | `app/` |
| `apple-icon.png` | 180×180 | iOS home screen bookmark | `app/` |
| `icon-192.png` | 192×192 | Android home screen / PWA | `public/` |
| `icon-512.png` | 512×512 | Android splash screen / PWA | `public/` |
| `og-image.png` | 1200×630 | Social share preview (Slack, Twitter, iMessage, etc.) | `public/` |

> Next.js auto-generates the correct `<link>` tags for `favicon.ico`, `icon.png`, and `apple-icon.png` just from the files existing in `app/`. No manual HTML needed.

## 3. Wire up the OG image

Once `public/og-image.png` exists, add it to the root layout metadata in `app/layout.tsx`:

```ts
openGraph: {
  type: "website",
  siteName: "Soonercharger",
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Soonercharger – Tesla Supercharger Buildout Tracker",
    },
  ],
},
twitter: {
  card: "summary_large_image", // upgrade from current "summary"
  images: ["/og-image.png"],
},
```

## 4. Add `app/manifest.ts`

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Soonercharger",
    short_name: "Soonercharger",
    description: "Track Tesla Supercharger buildout progress in real time.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff9500",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

Next.js serves this automatically at `/manifest.webmanifest`.

## Already done

- ~~`themeColor: "#ff9500"` in root layout metadata~~ ✅
