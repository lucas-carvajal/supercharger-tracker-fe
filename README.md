# Supercharger Tracker FE

Frontend for tracking Tesla Supercharger locations that are coming soon, under construction, or in development.

## Environment Variables

The app uses these environment variables:

- `BACKEND_URL`: Base URL for the backend API, for example `http://localhost:8080` locally or `http://rust-be:8080` in Coolify.
- `ADMIN_USERNAME`: Username for the `/admin/login` form. Defaults to `admin52662`.
- `ADMIN_PASSWORD`: Password for the `/admin/login` form.
- `ADMIN_SESSION_SECRET`: Long random secret used to sign the admin session cookie.
- `RUST_INTERNAL_IMPORT_SECRET`: Shared secret sent from the admin panel to the backend import endpoints.
- `SITE_URL`: Public canonical URL for metadata, sitemap, and robots. Defaults to `https://soonercharger.com`.
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`: Public Cloudflare Web Analytics token. This is embedded at build time; omit it to disable analytics.

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Generate a strong 256-bit session secret for `ADMIN_SESSION_SECRET` with:

```bash
openssl rand -hex 32
```

Copy the output into your local `.env.local` or deployment environment.

## Local Development

Install dependencies and start the Next.js dev server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you want the app to load real data locally, set `BACKEND_URL` before starting the dev server:

```bash
BACKEND_URL=http://localhost:8080 npm run dev
```

## Docker

Build the production image locally:

```bash
docker build -t supercharger-tracker-fe:local .
```

Run the container locally:

```bash
docker run --rm -p 3000:3000 \
  -e BACKEND_URL=http://host.docker.internal:8080 \
  -e ADMIN_USERNAME=admin52662 \
  -e ADMIN_PASSWORD=replace-with-strong-unique-password \
  -e ADMIN_SESSION_SECRET=replace-with-a-long-random-secret \
  -e RUST_INTERNAL_IMPORT_SECRET=replace-with-the-backend-import-secret \
  --name supercharger-tracker-fe \
  supercharger-tracker-fe:local
```

Then open [http://localhost:3000](http://localhost:3000).

Notes:

- `BACKEND_URL` is required at runtime. The app uses it in server-rendered pages and route handlers.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` control access to `/admin`.
- `RUST_INTERNAL_IMPORT_SECRET` is required when running admin imports or reading the current import version.
- See [docs/admin-auth.md](docs/admin-auth.md) for the admin session token and import auth flow.
- `http://host.docker.internal:8080` works on Docker Desktop. On Linux, replace it with an address your container can reach for the backend API.
- The container listens on port `3000`.

## Coolify

This repo includes a production-ready multi-stage `Dockerfile` for Coolify. Configure the required environment variables in Coolify and expose port `3000`.

If your backend service is named `rust-be`, a typical internal URL is:

```bash
BACKEND_URL=http://rust-be:8080
ADMIN_USERNAME=admin52662
ADMIN_PASSWORD=replace-with-strong-unique-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
RUST_INTERNAL_IMPORT_SECRET=replace-with-the-backend-import-secret
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=replace-with-cloudflare-web-analytics-token
```

## Troubleshooting

If `docker build` fails during `next build`, fix any TypeScript or lint errors in the app first. The image build runs the full production build, so application build errors will also fail the Docker image build.
