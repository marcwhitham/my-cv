import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/my-cv",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
