/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
    typescript: {
        ignoreBuildErrors: true, // ignore ALL TypeScript errors
    },
  images: { unoptimized: true },
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Try disabling SWC minification
    swcMinify: false,
    // Try disabling compiler optimization
    compiler: {
        removeConsole: false,
    },
    // Proxy API calls through Vercel to avoid mixed content (HTTPS → HTTP)
    async rewrites() {
        const backendUrl = process.env.BACKEND_PROXY_URL || 'http://198.245.55.46:8000';
        return [
            {
                source: '/api/v1/:path*',
                destination: `${backendUrl}/api/v1/:path*`,
            },
            // Proxy avatar/upload files served by the backend
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
