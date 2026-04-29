# Admin Auth

The admin area is protected in the Next.js app. The Rust backend does not manage browser sessions for `/admin`.

The browser should only talk to the public Next.js app for admin flows. Next.js validates the browser session, then calls the Rust backend from server-side code with an internal secret. The browser should not receive a Rust-issued admin token or call the Rust import endpoint directly.

## Configuration

Set these values anywhere the Next.js server runs:

```env
ADMIN_USERNAME=admin52662
ADMIN_PASSWORD=replace-with-strong-unique-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
RUST_INTERNAL_IMPORT_SECRET=replace-with-the-backend-import-secret
```

`ADMIN_USERNAME` defaults to `admin52662` if it is not set. `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are required for sign-in.

Generate a session secret with:

```bash
openssl rand -hex 32
```

## Login Flow

1. The browser submits `/admin/login`.
2. The `login` server action reads `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
3. If the credentials match, Next.js creates an `admin_session` cookie.
4. The browser is redirected to `/admin`.

The session token is not a JWT. It is a compact signed value:

```text
base64url({"sub":"admin","exp":...}).base64url(hmac-sha256(payload, ADMIN_SESSION_SECRET))
```

The payload contains:

- `sub`: always `admin`
- `exp`: Unix timestamp for the one-hour session expiry

## Cookie Behavior

The cookie is set with:

- `HttpOnly`
- `SameSite=Lax`
- `Path=/admin`
- `Secure` in production
- `Max-Age=3600`

Because the token is stateless, logout clears the browser cookie but does not revoke a copied token server-side. Rotating `ADMIN_SESSION_SECRET` invalidates all existing admin sessions.

## Route Protection

`proxy.ts` runs for `/admin/:path*`.

- Requests to `/admin/login` with a valid session redirect to `/admin`.
- Requests to any other `/admin` path without a valid session redirect to `/admin/login`.
- GET requests use a `307` redirect.
- Non-GET requests use a `303` redirect.

Admin pages also export `robots: { index: false, follow: false }`, and `/robots.txt` disallows `/admin`.

## Import Flow

The admin import form is a protected server action:

1. `runImport` calls `requireAdminSession()`.
2. The action validates pasted or uploaded JSON.
3. The action forwards the payload to `${BACKEND_URL}/admin/import/scrapes`.
4. The request includes `X-Admin-Internal-Secret: ${RUST_INTERNAL_IMPORT_SECRET}`.

The backend must validate `RUST_INTERNAL_IMPORT_SECRET` independently. The browser never receives this secret.

If more import routes are added later, keep them under `/admin/import/...` on the backend and protect them with the same internal-secret pattern.

## Errors And Logging

Client-facing authentication configuration errors are intentionally generic:

- `Sign in is temporarily unavailable.`
- `Import is temporarily unavailable.`

The exact missing configuration is logged on the Next.js server with an `[admin]` prefix, for example:

```text
[admin] ADMIN_SESSION_SECRET is not configured.
```

This keeps env var names and operational details out of the browser while preserving useful deployment logs.
