import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so a stray lockfile in a parent directory
    // doesn't change root inference.
    root: __dirname,
  },
};

export default nextConfig;
