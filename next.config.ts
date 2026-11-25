import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.47"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "aurja.co.in" }],
        destination: "https://www.aurja.co.in/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "www.aurja.co.in" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://www.aurja.co.in/:path*",
        permanent: true,
      },
      ...[
        "rings",
        "earrings",
        "pendants",
        "bracelets",
        "necklaces",
        "men",
        "silver",
      ].map((category) => ({
        source: "/products",
        has: [{ type: "query" as const, key: "category", value: category }],
        destination: `/${category}`,
        permanent: true,
      })),
    ];
  },
  images: {
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.swell.store",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/aurja/**",
      },
    ],
  },
};

export default nextConfig;
