import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export const getAdminSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
});

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function createAdminSession() {
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    ...getAdminSessionCookieOptions(),
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getAdminSessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
