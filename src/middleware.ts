import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { dashboardPathForRole } from "@/lib/dashboard-path";

/**
 * Edge middleware must NOT import next-auth/middleware or @/lib/auth-options —
 * those pull in openid-client and break the Edge runtime.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;
  const home = dashboardPathForRole(role);

  if (path === "/dashboard") {
    return NextResponse.redirect(new URL(home, req.url));
  }

  if (path.startsWith("/dashboard/super-admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (path.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(home, req.url));
    }
  }
  if (path.startsWith("/dashboard/user") && role !== "USER") {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/entries/:path*",
    "/api/users/:path*",
    "/api/messages/:path*",
    "/api/stats/:path*",
  ],
};
