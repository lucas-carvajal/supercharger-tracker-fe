# Admin Import Auth Plan

## Decision

Do admin auth in Next.js, not in Rust.

Why:

- Next.js is the public app the browser already talks to
- Rust is private on Render's internal network
- this keeps browser auth out of the Rust service
- Rust only needs to trust the Next.js server, not end users directly

---

## Architecture Overview

### Browser -> Next.js

The browser talks only to the public Next.js app.

Next.js is responsible for:

- showing the admin login UI
- checking username `admin` and `ADMIN_PASSWORD`
- setting and clearing the `HttpOnly` admin session cookie
- protecting admin pages and actions

### Next.js -> Rust

Next.js server code calls the Rust backend over Render private networking.

Rust is responsible for:

- exposing the private import endpoints
- checking an internal secret header such as `X-Admin-Internal-Secret`
- rejecting any import request without the correct secret

### Browser -> Rust

This should not happen for admin auth.

The browser does not need:

- a Rust-issued token
- a Rust login endpoint
- direct access to the Rust backend

---

## Request Flow

### Login

1. Admin submits login form to Next.js.
2. Next.js checks:
   - username must equal `admin`
   - password must equal `ADMIN_PASSWORD`
3. Next.js sets an `HttpOnly` session cookie with:
   - name: `admin_session`
   - `HttpOnly`
   - `Secure`
   - `SameSite=Lax`
   - `Path=/admin`
   - 1 hour expiry

The admin UI and login/logout routes are expected to live on the same public Next.js origin.

### Import action

1. Browser calls a protected Next.js admin action or route.
2. Next.js validates the admin session cookie.
3. Next.js sends the import request to Rust over the private network.
4. Next.js includes `X-Admin-Internal-Secret`.
5. Rust verifies the secret and runs the import.

### Logout

1. Browser calls `POST /admin/logout` on Next.js.
2. Next.js clears the admin session cookie.

Logout is still useful because it ends the current browser session. It does **not** instantly invalidate a copied stateless token somewhere else. For this plan, that tradeoff is acceptable because the admin session is short-lived at 1 hour. If true server-side revocation is needed later, switch from a purely stateless session token to a server-side session store.

---

## What Needs To Be Implemented

### In Next.js

- `POST /admin/login`
- `POST /admin/logout`
- admin session cookie using `HttpOnly`, `Secure`, and 1 hour expiry
- admin page / action guard that checks the session
- server-side call to the private Rust import endpoint

### In Rust

- move import endpoints under `/admin/import/...`
- replace `X-Import-Token` with `X-Admin-Internal-Secret`
- reject requests missing the internal secret
- remove the old `/scrapes/import` + `X-Import-Token` path once Next.js is switched over; do not keep both long-term

---

## Required Config

### Next.js

```env
ADMIN_PASSWORD=replace-with-strong-unique-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
RUST_INTERNAL_IMPORT_SECRET=replace-with-a-different-long-random-secret
```

The admin username is hardcoded to `admin`.

### Rust

```env
RUST_INTERNAL_IMPORT_SECRET=replace-with-the-same-secret-used-by-nextjs-server
```

On Render, store all of these as secret environment variables.

---

## Route Shape

### Next.js

- `POST /admin/login`
- `POST /admin/logout`
- admin UI under `/admin`
- existing private-backend server call path can be reused; no new Rust base URL config is required if the frontend already has it

### Rust

- `POST /admin/import/scrapes`

This route should keep the same request body, query params, response formats, and import behavior as the current `POST /scrapes/import` endpoint. The intended change is route location and auth model, not import semantics.

If more import routes are added later, keep them under `/admin/import/...`.

---

## Notes

- The `HttpOnly` cookie belongs in Next.js, because that is the public web layer.
- Rust still protects the endpoint, but it protects it from untrusted services, not from browsers directly.
- This is simpler and fits your Render setup better than doing end-user auth in Rust.
