/* global process */
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api').trim().replace(/[\r\n]+/g, '');
    const apiUrl = rawApiUrl.replace(/\/+$/, '');
    return [
      {
        source: '/apresentacao',
        destination: '/apresentacao/index.html',
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

const withVercelToolbar = createWithVercelToolbar();

export default withVercelToolbar(nextConfig);

