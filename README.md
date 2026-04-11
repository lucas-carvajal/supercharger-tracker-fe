# Supercharger Tracker FE

Frontend for tracking Tesla Supercharger locations that are coming soon, under construction, or in development.

## Local Development

Install dependencies and start the Next.js dev server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you want the app to load real data locally, set `SUPERCHARGER_API_URL` before starting the dev server:

```bash
SUPERCHARGER_API_URL=http://localhost:8000 npm run dev
```

## Docker

Build the production image locally:

```bash
docker build -t supercharger-tracker-fe:local .
```

Run the container locally:

```bash
docker run --rm -p 3000:3000 \
  -e SUPERCHARGER_API_URL=http://host.docker.internal:8000 \
  --name supercharger-tracker-fe \
  supercharger-tracker-fe:local
```

Then open [http://localhost:3000](http://localhost:3000).

Notes:

- `SUPERCHARGER_API_URL` is required at runtime. The app uses it in server-rendered pages and route handlers.
- `http://host.docker.internal:8000` works on Docker Desktop. On Linux, replace it with an address your container can reach for the backend API.
- The container listens on port `3000`.

## Coolify

This repo includes a production-ready multi-stage `Dockerfile` for Coolify. Configure `SUPERCHARGER_API_URL` as an environment variable in Coolify and expose port `3000`.

## Troubleshooting

If `docker build` fails during `next build`, fix any TypeScript or lint errors in the app first. The image build runs the full production build, so application build errors will also fail the Docker image build.
