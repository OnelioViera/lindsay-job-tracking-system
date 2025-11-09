import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    // Middleware logic here if needed
    // For now, just protecting routes based on authentication
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect dashboard and internal routes only
export const config = {
  matcher: [
    // Protect dashboard and internal app routes, but allow home page and public routes
    '/dashboard/:path*',
    '/jobs/:path*',
    '/customers/:path*',
    '/inventory/:path*',
    '/settings/:path*',
  ],
};

