import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirect } from "@/lib/canonical-host";

export function proxy(request: NextRequest) {
  const location = canonicalRedirect({
    method: request.method,
    host: request.headers.get("host"),
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });
  return location ? NextResponse.redirect(location, 308) : NextResponse.next();
}

export const config = {
  // Static chunks, image optimisation and icons are skipped for speed only.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
