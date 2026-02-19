// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentPhase, isRouteAllowed } from './lib/phases';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const currentPhase = getCurrentPhase();

    // Check if route is allowed in current phase
    if (!isRouteAllowed(pathname, currentPhase)) {
        // Redirect to phase restriction page
        const url = new URL('/phase-restriction', request.url);
        url.searchParams.set('requestedPath', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - phase-restriction (the restriction page itself)
         * - uploads (static file uploads served via backend proxy)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|phase-restriction|uploads).*)',
    ],
};