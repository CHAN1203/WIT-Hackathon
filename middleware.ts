import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Current URL:", req.nextUrl.pathname)
  console.log("Session exists:", !!session)
  console.log("Session data:", session) // Additional debug log

  // If no session and trying to access protected routes
  if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/onboarding"))) {
    const redirectUrl = new URL("/auth/login", req.url)
    console.log("Redirecting to:", redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth pages
  if (session && (req.nextUrl.pathname.startsWith("/auth/login") || req.nextUrl.pathname.startsWith("/auth/signup"))) {
    const redirectUrl = new URL("/dashboard", req.url)
    console.log("Redirecting to:", redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

