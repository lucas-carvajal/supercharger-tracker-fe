<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Supercharger Tracker FE Agent Guide

## Project Context

- This is a Next.js 16 App Router frontend for tracking Tesla Supercharger locations.
- Public routes live under `app/(public)`.
- Admin routes live under `app/(admin)/admin` and must stay unlinked from public navigation.
- Shared UI components live in `components`; data and auth helpers live in `lib`.
- Use the existing Tailwind and component patterns before adding new abstractions.

## Common Commands

```bash
npm run lint
npm run build
npm run dev
```

Run `npm run lint` after code or docs-adjacent JSX changes. Run `npm run build` for routing, metadata, auth, or deployment-sensitive changes.

## Environment Variables

The main runtime variables are documented in `README.md` and `.env.example`.

- `BACKEND_URL`
- `SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `RUST_INTERNAL_IMPORT_SECRET`

Do not expose local `.env` values in logs, screenshots, commits, or comments. `.env.example` is intentionally unignored and should contain placeholders only.

## Admin Auth

- Read `docs/admin-auth.md` before changing admin login, cookies, proxy protection, or import auth.
- Client-facing auth/configuration errors should stay generic.
- Log exact operational configuration failures on the server with the `[admin]` prefix.
- Admin pages should remain `noindex,nofollow`, `/robots.txt` should disallow `/admin`, and public SEO structured data should not be injected into admin pages.

## Documentation Index

Review and update relevant docs when behavior changes:

- `docs/admin-auth.md` — admin login, session token, cookie, proxy, and import auth flow.
- `docs/seo.md` — public SEO metadata, sitemap, robots, structured data, and favicon behavior.
- `docs/testing/seo.md` — manual SEO verification checklist.
- `docs/plans/seo-improvements.md` — SEO improvement plan.
- `docs/plans/todo-mobile-icons.md` — mobile icon and PWA-related follow-up notes.

## Privacy And Terms

After every change, check whether the change affects what data is collected, how external services are used, or what guarantees are made about data accuracy or uptime. If so, update the relevant sections in `app/(public)/privacy/page.tsx` and/or `app/(public)/terms/page.tsx` and bump the "Last updated" date.
