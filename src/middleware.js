import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "lalapanku_token";
const PUBLIC_PAGES = ["/login"];

async function isValid(token) {
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-min-32-chars-please-change"));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValid(token);

  if (PUBLIC_PAGES.includes(pathname)) {
    if (valid) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (!valid) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/transaksi/:path*", "/riwayat/:path*", "/laporan/:path*", "/menu/:path*"],
};