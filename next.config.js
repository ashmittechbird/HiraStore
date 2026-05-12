/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5500';
    return [
      { source: '/erp/:path*', destination: `${backendUrl}/erp/:path*` },
      { source: '/api/auth/:path*', destination: `${backendUrl}/api/auth/:path*` },
      { source: '/api/orders/:path*', destination: `${backendUrl}/api/orders/:path*` },
      { source: '/api/customer/:path*', destination: `${backendUrl}/api/customer/:path*` },
      { source: '/api/homepage/:path*', destination: `${backendUrl}/api/homepage/:path*` },
      { source: '/api/coupon/:path*', destination: `${backendUrl}/api/coupon/:path*` },
      { source: '/api/offers', destination: `${backendUrl}/api/offers` },
      { source: '/api/square-payment', destination: `${backendUrl}/api/square-payment` },
      { source: '/catalog_images/:path*', destination: `${backendUrl}/catalog_images/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'wearparts.norework.in' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

module.exports = nextConfig;
