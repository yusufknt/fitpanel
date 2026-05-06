import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/coach") && token.role !== "COACH") {
    return NextResponse.redirect(new URL("/student", req.url));
  }

  if (pathname.startsWith("/student") && token.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/coach", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coach/:path*", "/student/:path*"],
};
