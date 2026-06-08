import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native Swiss Ephemeris bindings must not be bundled by webpack/turbopack
  serverExternalPackages: ["sweph", "swisseph", "vedic-calc"],
};

export default nextConfig;
