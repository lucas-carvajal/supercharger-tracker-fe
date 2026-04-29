import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifyAdminSessionToken(token);
  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginRoute && !session) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url),
      request.method === "GET" ? 307 : 303,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
