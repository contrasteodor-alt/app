import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublic(pathname: string) {
  // Public pages
  if (pathname === "/login") return true;

  // Next internals
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;

  // ✅ Allow auth endpoints BEFORE login
  if (pathname.startsWith("/api/auth/")) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublic(pathname)) return NextResponse.next();

  // Allow static files
  if (pathname.match(/\.(.*)$/)) return NextResponse.next();

  const session = req.cookies.get("session")?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
