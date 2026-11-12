import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Página de vendas do Influencer com IA (HTML estático em public/influencer-com-ia)
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/influencer-com-ia', destination: '/influencer-com-ia/index.html' },
        { source: '/influencer-com-ia/', destination: '/influencer-com-ia/index.html' }
      ],
      afterFiles: [],
      fallback: []
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ];
  }
};

export default nextConfig;
