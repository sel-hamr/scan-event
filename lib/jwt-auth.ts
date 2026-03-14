import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";

type AuthTokenPayload = JWTPayload & {
  sub: string;
  role: UserRole;
};

export type AuthContext = {
  userId: string;
  role: UserRole;
};

const jwtSecret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_JWT_SECRET or NEXTAUTH_SECRET must be set in production.",
  );
}

const secret = new TextEncoder().encode(jwtSecret ?? "dev-only-auth-secret");

export async function signAuthToken(payload: AuthContext) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

function normalizePayload(payload: AuthTokenPayload): AuthContext | null {
  if (!payload.sub || typeof payload.sub !== "string") {
    return null;
  }

  if (
    !payload.role ||
    typeof payload.role !== "string" ||
    !Object.values(UserRole).includes(payload.role as UserRole)
  ) {
    return null;
  }

  return {
    userId: payload.sub,
    role: payload.role as UserRole,
  };
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify<AuthTokenPayload>(token, secret);
    return normalizePayload(payload);
  } catch {
    return null;
  }
}

export async function getAuthFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getAuthFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}
