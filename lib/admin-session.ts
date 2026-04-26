const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_DURATION_SECONDS = 60 * 60;

export interface AdminSession {
  sub: "admin";
  exp: number;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  return secret;
}

function getOptionalSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || null;
}

function encodeBase64Url(value: string | Uint8Array) {
  const buffer =
    typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);

  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = (4 - (normalized.length % 4)) % 4;

  return Buffer.from(`${normalized}${"=".repeat(padding)}`, "base64");
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string) {
  const key = await importSigningKey(getSessionSecret());
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return encodeBase64Url(new Uint8Array(signature));
}

async function verifySignature(value: string, signature: string) {
  const secret = getOptionalSessionSecret();
  if (!secret) {
    return false;
  }

  const key = await importSigningKey(secret);

  return crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64Url(signature),
    encoder.encode(value),
  );
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
    path: "/admin",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createAdminSessionToken() {
  const payload: AdminSession = {
    sub: "admin",
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const isValid = await verifySignature(encodedPayload, signature).catch(
    () => false,
  );
  if (!isValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      decodeBase64Url(encodedPayload).toString("utf8"),
    ) as Partial<AdminSession>;

    if (parsed.sub !== "admin" || typeof parsed.exp !== "number") {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed as AdminSession;
  } catch {
    return null;
  }
}
