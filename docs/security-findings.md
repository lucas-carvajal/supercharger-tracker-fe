# Security Findings

Audit date: 2026-06-09  
Status: **Open** — none of the findings below have been addressed yet.

When directing an AI agent at this file, ask it to fix one finding at a time, run `npm run lint && npm run build` after each change, and mark the finding as **Fixed** with a note on what was changed.

---

## CRITICAL

### C1 — `proxy.ts` not wired as middleware

**File:** `proxy.ts:1-30`  
**Status:** Open

`proxy.ts` exports an admin session guard with a correct Next.js `matcher` config (`/admin/:path*`), but the file is never used because Next.js only loads middleware from a file literally named `middleware.ts` (or `middleware.js`) at the project root. The function is dead code. All admin route protection currently falls on individual page-level `requireAdminSession()` calls — one missed call is a full bypass.

**Fix:** Rename `proxy.ts` → `middleware.ts` at the project root. Verify the matcher and redirect logic are still correct after the rename. Run `npm run build` to confirm routing.

---

### C2 — Timing attack on login credential comparison

**File:** `app/(admin)/admin/actions.ts:34-36`  
**Status:** Open

Username and password are compared with the JavaScript `!==` operator, which is not constant-time. A remote attacker can measure response latency to determine whether the username alone is correct before starting to guess the password, and potentially narrow down password characters.

```typescript
// current (vulnerable)
if (username !== expectedUsername || password !== expectedPassword) {
```

**Fix:** Convert both strings to `Buffer` and compare with `crypto.timingSafeEqual()`. Example:

```typescript
import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  // Buffers must be the same length for timingSafeEqual; pad to avoid length leak
  const len = Math.max(ba.length, bb.length);
  return timingSafeEqual(
    Buffer.concat([ba], len),
    Buffer.concat([bb], len),
  );
}

if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
```

---

### C3 — No rate limiting on the login action

**File:** `app/(admin)/admin/actions.ts:16-57`  
**Status:** Open

The `login` server action has no per-IP throttle, lockout, or brute-force protection. An attacker can attempt unlimited password combinations with no delay or consequence.

**Fix:** Add rate limiting keyed on the client IP before the credential check. Options:
- **Upstash Ratelimit** (Redis-backed, works on edge/serverless) — `@upstash/ratelimit`
- **next-rate-limit** — in-process, simpler but not clustered
- A simple in-memory `Map<ip, {count, resetAt}>` is acceptable for a single-server deployment

Reject with a generic `"Too many attempts. Try again later."` error and do not log the attempted credentials.

---

### C4 — Default admin username committed to version control

**File:** `.env.example:3`  
**Status:** Open

```env
ADMIN_USERNAME=admin52662
```

The actual default username is public knowledge to anyone with repository access. If a deployment forgets to override this value, the username half of the credential pair is already known.

**Fix:** Replace with a placeholder:

```env
ADMIN_USERNAME=your-admin-username
```

Also audit whether `admin52662` is used as an actual username in any deployed environment and rotate it if so.

---

## HIGH

### H1 — No file size limit on import upload

**File:** `app/(admin)/admin/actions.ts:99-101`  
**Status:** Open

`uploadedFile.text()` is called without first checking the file size. A multi-gigabyte file will be read entirely into memory, causing an out-of-memory crash or denial of service.

```typescript
// current (vulnerable)
if (uploadedFile instanceof File && uploadedFile.size > 0) {
  payloadText = await uploadedFile.text();
}
```

**Fix:** Reject files above a reasonable limit before reading:

```typescript
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
if (uploadedFile instanceof File && uploadedFile.size > 0) {
  if (uploadedFile.size > MAX_UPLOAD_BYTES) {
    return { error: "File too large. Maximum size is 5 MB.", result: null, response: null };
  }
  payloadText = await uploadedFile.text();
}
```

---

### H2 — Session tokens are non-revocable

**File:** `lib/admin-session.ts:88-97`  
**Status:** Open

Tokens are stateless (HMAC-signed, not stored server-side). Logout deletes the cookie on the client but the token itself remains valid until expiry. A stolen token grants 1-hour access with no way to invalidate it.

**Fix (minimal):** Maintain a small server-side denylist (in-memory Set or Redis) of invalidated token signatures. On logout, add the token signature to the denylist. On verification, reject tokens whose signature appears in the denylist. Prune entries whose `exp` has passed.

**Fix (complete):** Replace the custom token with a proper server-side session store: generate a random session ID, store `{ sessionId → { sub, exp } }` in Redis/DB, set the session ID as the cookie value. Logout deletes the record.

---

### H3 — No session token rotation

**File:** `lib/admin-session.ts:88-97`  
**Status:** Open

The session token is issued once on login and never refreshed. The full 1-hour validity window applies to a stolen token regardless of how long the legitimate user has been active or idle.

**Fix:** Reissue a new token (with a fresh `exp`) on every authenticated request and `Set-Cookie` it in the response. This is a sliding-window approach and limits the usefulness of a captured token to the configured idle timeout rather than the full absolute expiry.

---

### H4 — No explicit CSRF protection on admin server actions

**File:** `app/(admin)/admin/actions.ts` (all three actions)  
**Status:** Open

Next.js 15+ performs origin checking for Server Actions, which mitigates most CSRF vectors. However, `runImport` mutates external state (triggers a backend import) and has no additional guard. If the built-in origin check is bypassed or misconfigured, a cross-site request could trigger an import.

**Fix:**
1. Confirm the Next.js version's exact CSRF guarantees for Server Actions (`node_modules/next/dist/docs/` per AGENTS.md).
2. Add an explicit `Origin`/`Referer` header check inside `runImport` as a defence-in-depth measure, or require an anti-CSRF nonce embedded in the form from a prior server render.

---

## MEDIUM

### M1 — Backend error details surfaced to the admin UI

**File:** `app/(admin)/admin/actions.ts:155-169`  
**Status:** Open

The full raw response body from the backend is returned as `state.response` and rendered in `ImportForm`. If the backend returns a stack trace, internal paths, or library versions in an error response, these are visible to anyone with admin access (and to anyone who compromises an admin session).

**Fix:** Keep raw backend responses in server-side logs only. Return only a sanitized string (e.g. `"Import failed. See server logs for details."`) in the client-facing `state.response` on error paths.

---

### M2 — No bounds or enum validation on API query parameters

**File:** `app/api/superchargers/soon/route.ts:14-19` and `lib/contracts/supercharger.ts:67-72`  
**Status:** Open

The Zod schema accepts any string for `limit`, `offset`, `status`, and `region`. There is no upper bound on `limit`, no integer coercion check on `offset`, and no allowlist for `status` or `region`. Malicious values are forwarded to the backend verbatim.

```typescript
// current — accepts any string
export const SuperchargersSoonQuerySchema = z.object({
  limit: z.string().nullable().optional(),
  offset: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
});
```

**Fix:**

```typescript
export const SuperchargersSoonQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  status: z.enum(["construction", "permit", "open"]).optional(), // adjust to real values
  region: z.string().max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});
```

---

### M3 — No server-side Content-Type validation on file uploads

**File:** `components/admin/ImportForm.tsx:25-31` + `app/(admin)/admin/actions.ts:99-101`  
**Status:** Open

The `accept="application/json,.json"` attribute on the file input is enforced only by the browser. The server reads any uploaded file as text without checking its MIME type.

**Fix:** Add a server-side check before reading:

```typescript
if (uploadedFile instanceof File && uploadedFile.size > 0) {
  if (!["application/json", "text/plain"].includes(uploadedFile.type)) {
    return { error: "Only JSON files are accepted.", result: null, response: null };
  }
  // ...size check, then read
}
```

---

### M4 — No audit logging for admin actions

**File:** `app/(admin)/admin/actions.ts`  
**Status:** Open

Successful logins, failed login attempts, imports, and logouts produce no log output. There is no audit trail for incident response or abuse detection.

**Fix:** Add structured `console.log` (or a proper logger) lines for each outcome. Minimum recommended events:

| Event | Data to log |
|---|---|
| Login success | timestamp, IP (from request headers) |
| Login failure | timestamp, IP, provided username (not password) |
| Logout | timestamp |
| Import triggered | timestamp, payload size |
| Import result | timestamp, HTTP status from backend |

Use the existing `[admin]` prefix convention already established in `logAdminConfigError`.

---

### M5 — Missing HTTP security headers

**File:** `next.config.ts` (or a middleware file)  
**Status:** Open

No middleware or `next.config.ts` `headers()` block sets standard security headers. The application is missing:

- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — limits script/style sources
- `Strict-Transport-Security` — enforces HTTPS

**Fix:** Add a `headers()` export to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    },
  ];
},
```

CSP should be added carefully to avoid breaking existing assets — audit inline scripts and external sources first.

---

### M6 — No startup validation of required environment variables

**File:** Multiple (`lib/admin-session.ts`, `app/(admin)/admin/actions.ts`, `app/api/`)  
**Status:** Open

All required env vars (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BACKEND_URL`, `RUST_INTERNAL_IMPORT_SECRET`) are checked lazily at call time. A misconfigured deployment silently serves broken pages until each feature is manually exercised.

**Fix:** Create `lib/env.ts` that validates and exports all required vars at module load time, throwing immediately if any are absent. Import it from the app's entry point or from `instrumentation.ts` (Next.js's server startup hook).

```typescript
// lib/env.ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  adminPassword: requireEnv("ADMIN_PASSWORD"),
  adminSessionSecret: requireEnv("ADMIN_SESSION_SECRET"),
  backendUrl: requireEnv("BACKEND_URL"),
  rustImportSecret: requireEnv("RUST_INTERNAL_IMPORT_SECRET"),
};
```

---

## LOW

### L1 — `SameSite=Lax` on admin session cookie

**File:** `lib/admin-session.ts:83`  
**Status:** Open

The admin session cookie uses `SameSite: "lax"`, which allows the cookie to be sent on top-level cross-site navigations (e.g. clicking a link from an external page). Since there is no legitimate reason for cross-site navigation to the admin panel, `Strict` is the appropriate value.

**Fix:**

```typescript
sameSite: "strict" as const,
```

---

### L2 — `secure` cookie flag absent in non-production environments

**File:** `lib/admin-session.ts:84`  
**Status:** Open (accepted risk for local dev)

```typescript
secure: process.env.NODE_ENV === "production",
```

The session cookie is not `Secure` in development and staging environments, meaning it can be sent over plain HTTP. This is standard practice for local development ergonomics but is a risk if staging runs over HTTP.

**Fix:** Ensure all non-local environments (staging, preview) are HTTPS-only. Optionally add a separate `FORCE_SECURE_COOKIES=true` env var to opt staging environments in regardless of `NODE_ENV`.

---

### L3 — Session token payload is not encrypted

**File:** `lib/admin-session.ts:88-96`  
**Status:** Open (low priority)

The token format is `base64(payload).hmac_signature`. The payload is base64-encoded but not encrypted, so its contents (`{"sub":"admin","exp":...}`) are readable by anyone who can read the cookie. This is not directly exploitable but violates defence-in-depth.

**Fix (optional):** Switch to a library like `iron-session` that encrypts the session payload, or use `jose` to produce a JWE (encrypted JWT) instead of a plain signed JWT.

---

## Summary Table

| ID | Severity | Title | File | Status |
|----|----------|-------|------|--------|
| C1 | Critical | `proxy.ts` not wired as middleware | `proxy.ts` | Open |
| C2 | Critical | Timing attack on credential comparison | `actions.ts:34-36` | Open |
| C3 | Critical | No rate limiting on login | `actions.ts:16-57` | Open |
| C4 | Critical | Default username in `.env.example` | `.env.example:3` | Open |
| H1 | High | No file size limit on upload | `actions.ts:99-101` | Open |
| H2 | High | Session tokens non-revocable | `admin-session.ts:88-97` | Open |
| H3 | High | No session token rotation | `admin-session.ts:88-97` | Open |
| H4 | High | No CSRF protection on server actions | `actions.ts` | Open |
| M1 | Medium | Backend errors surfaced to UI | `actions.ts:155-169` | Open |
| M2 | Medium | No bounds/enum validation on API params | `route.ts:14-19` | Open |
| M3 | Medium | No server-side Content-Type check on upload | `actions.ts:99-101` | Open |
| M4 | Medium | No audit logging for admin actions | `actions.ts` | Open |
| M5 | Medium | Missing HTTP security headers | `next.config.ts` | Open |
| M6 | Medium | No startup env var validation | Multiple | Open |
| L1 | Low | `SameSite=Lax` on admin cookie | `admin-session.ts:83` | Open |
| L2 | Low | `secure` flag absent outside production | `admin-session.ts:84` | Open |
| L3 | Low | Session token payload not encrypted | `admin-session.ts:88-96` | Open |
