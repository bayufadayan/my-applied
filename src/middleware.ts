import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth");

  // Redirect to dashboard if logged in and on auth page
  if (isLoggedIn && isOnAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect to login if not logged in and trying to access dashboard
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
