import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native Swiss Ephemeris bindings must not be bundled by webpack/turbopack
  serverExternalPackages: ["sweph"],
};

export default nextConfig;
