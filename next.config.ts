import type { NextConfig } from 'next';

// As páginas estáticas aprovadas (Home, Ferramentas, Influencer com IA e Biblioteca)
// continuam em public/ e são servidas exatamente como antes, nas mesmas URLs.
const staticPages = ['ferramentas', 'influencer-com-ia', 'biblioteca-de-prompts'];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        ...staticPages.flatMap((page) => [
          { source: `/${page}`, destination: `/${page}/index.html` },
          { source: `/${page}/`, destination: `/${page}/index.html` }
        ])
      ],
      afterFiles: [],
      fallback: []
    };
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

export default nextConfig;
