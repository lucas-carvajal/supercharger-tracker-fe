# Supercharger Tracker FE

Frontend for tracking Tesla Supercharger locations that are coming soon, under construction, or in development.

## Environment Variables

Required unless mock mode is enabled:

- `BACKEND_URL`: Base URL for the backend API, for example `http://localhost:8080` locally or `http://rust-be:8080` in Coolify.

Optional:

- `ENABLE_MOCK_DATA`: Set to `true` to serve built-in mock data from the server layer instead of the backend API. Defaults to `false`.

Create a local env file from the example:

```bash
cp .env.example .env.local
```

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

If you don't have backend data available and want to use mock data:

```bash
ENABLE_MOCK_DATA=true npm run dev
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
  --name supercharger-tracker-fe \
  supercharger-tracker-fe:local
```

Then open [http://localhost:3000](http://localhost:3000).

Notes:

- `BACKEND_URL` is required at runtime only when `ENABLE_MOCK_DATA` is not `true`.
- `http://host.docker.internal:8080` works on Docker Desktop. On Linux, replace it with an address your container can reach for the backend API.
- The container listens on port `3000`.

## Coolify

This repo includes a production-ready multi-stage `Dockerfile` for Coolify. Configure `BACKEND_URL` as an environment variable in Coolify and expose port `3000`.

If your backend service is named `rust-be`, a typical internal URL is:

```bash
BACKEND_URL=http://rust-be:8080
```

## Troubleshooting

If `docker build` fails during `next build`, fix any TypeScript or lint errors in the app first. The image build runs the full production build, so application build errors will also fail the Docker image build.
