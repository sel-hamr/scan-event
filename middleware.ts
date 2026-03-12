import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === "/login" || pathname === "/register";

  if (!userId && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const participantRestrictedPaths = [
    "/",
    "/tickets",
    "/scanner",
    "/speakers",
    "/exposants",
    "/sponsors",
    "/companies",
    "/settings",
    "/events/create",
  ];

  if (
    userId &&
    userRole === "PARTICIPANT" &&
    participantRestrictedPaths.some(
      (restrictedPath) =>
        pathname === restrictedPath ||
        pathname.startsWith(`${restrictedPath}/`),
    )
  ) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
