import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Only protect /admin/projects route
  if (request.nextUrl.pathname === "/admin/projects") {
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      // If no admin password is set, allow access (fallback to client-side protection)
      return NextResponse.next()
    }

    const authCookie = request.cookies.get("admin-auth")

    if (authCookie?.value === adminPassword) {
      return NextResponse.next()
    }

    // Check for password in query params (for initial auth)
    const password = request.nextUrl.searchParams.get("password")
    if (password === adminPassword) {
      const response = NextResponse.next()
      response.cookies.set("admin-auth", adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    // Return 401 Unauthorized
    return new NextResponse("Unauthorized", { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/projects",
}
