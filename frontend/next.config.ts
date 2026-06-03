import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Запросы к dev-серверу идут через Caddy с origin https://localhost
  allowedDevOrigins: ["localhost"],
};

export default nextConfig;
