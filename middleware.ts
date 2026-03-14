import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/jwt-auth";

export async function middleware(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const userId = auth?.userId;
  const userRole = auth?.role;
  const { pathname } = request.nextUrl;
  const isParticipantTicketRoute =
    pathname === "/tickets/mine" || pathname.startsWith("/tickets/mine/");

  const isPublicPath = pathname === "/login" || pathname === "/register";

  if (!userId && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && userId) {
    const redirectPath = userRole === "SUPER_ADMIN" ? "/" : "/events";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (userId && userRole === "PARTICIPANT" && pathname === "/tickets") {
    return NextResponse.redirect(new URL("/tickets/mine", request.url));
  }

  const participantRestrictedPaths = [
    "/",
    "/tickets",
    "/scanner",
    "/speakers",
    "/exposants",
    "/sponsors",
    "/companies",
    "/events/create",
  ];

  if (
    userId &&
    userRole === "PARTICIPANT" &&
    !isParticipantTicketRoute &&
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
