import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/sign-in", // Redirect to sign-in page if not authenticated
    },
    callbacks: {
      authorized: ({ token }) => {
        return !!token; // Ensure token exists
      },
    },
  }
);

// Define protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Protect specific routes
};
