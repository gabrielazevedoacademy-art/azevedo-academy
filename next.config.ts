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
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Navegador só fala com o site por HTTPS, por 2 anos
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          // Bloqueia recursos do navegador que o site não usa
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Impede que outro site carregue páginas daqui dentro de um iframe, plugins e troca da base dos links
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests" }
        ]
      },
      // Painel, conta e dados pessoais: nunca guardar em cache compartilhado
      ...['/admin/:path*', '/perfil', '/configuracoes', '/meus-dados'].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }]
      }))
    ];
  }
};

export default nextConfig;
