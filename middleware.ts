import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const isAuthSession = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')

  // if (request.nextUrl.pathname.startsWith('/dashboard') && !isAuthSession) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // if (request.nextUrl.pathname === '/login' && isAuthSession) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
