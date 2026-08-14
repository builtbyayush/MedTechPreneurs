import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { isPublicRoute } from "@/config/auth";
import { ROUTES } from "@/constants/routes";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isLoggedIn = !!request.auth?.user;
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    if (
      isLoggedIn &&
      (pathname === ROUTES.home ||
        pathname === ROUTES.login ||
        pathname === ROUTES.register)
    ) {
      return NextResponse.redirect(new URL(ROUTES.app.home, request.nextUrl));
    }

    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL(ROUTES.login, request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon|apple-icon|offline|icon-192|icon-512|images).*)",
  ],
};
