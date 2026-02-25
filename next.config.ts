import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  compiler: {
    styledComponents: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3e437263844040f89f54d0fb123338fe.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

};

export default nextConfig;
