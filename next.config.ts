import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.47"],
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
