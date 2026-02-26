import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      {
        source: "/v1/:path*",
        destination: "http://localhost:8001/v1/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://localhost:8001/auth/:path*",
      },
      {
        source: "/me",
        destination: "http://localhost:8001/me",
      },
    ];
  },

};

export default nextConfig;
