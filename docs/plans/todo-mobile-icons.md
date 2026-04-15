# TODO: Mobile icon & PWA support

## 1. Generate the icons

Start from a single 512×512 PNG (or SVG) of the Soonercharger logo.
Use [RealFaviconGenerator](https://realfavicongenerator.net) or [Favicon.io](https://favicon.io) to export all sizes at once.

Files needed:

| File | Size | Where |
|---|---|---|
| `favicon.ico` | 16+32 px (multi-size) | `app/` — already exists |
| `icon.png` | 32×32 | `app/` |
| `apple-icon.png` | 180×180 | `app/` |
| `icon-192.png` | 192×192 | `public/` |
| `icon-512.png` | 512×512 | `public/` |

## 2. Add `app/manifest.ts`

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

## 3. Add `themeColor` to root layout metadata

```ts
// app/layout.tsx
export const metadata: Metadata = {
  // ...existing fields
  themeColor: "#ff9500",
};
```

## Done

Once the image files are in place and `manifest.ts` exists, Next.js handles all the `<link>` and `<meta>` tags automatically — no manual HTML edits needed.
