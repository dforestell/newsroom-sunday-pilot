import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkLogin, createSession, sessionCookieOptions } from "@/lib/admin/auth";
import { adminConfigured, sameOrigin } from "@/lib/admin/session";

export async function POST(request: Request) {
  const back = (query = "") => NextResponse.redirect(new URL(`/admin${query}`, request.url), 303);
  if (!adminConfigured() || !sameOrigin(request)) return back();
  const form = await request.formData();
  const email = checkLogin(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!email) return back("?error=login");
  const response = back();
  response.cookies.set(ADMIN_COOKIE, createSession(email), sessionCookieOptions);
  return response;
}
