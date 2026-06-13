/** @type {import('next').NextConfig} */

// The browser talks to the API same-origin (/api/*); Next proxies to the API service so the
// httpOnly auth cookie stays first-party. Override the target in containers (e.g. http://api:4000).
const apiOrigin = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
