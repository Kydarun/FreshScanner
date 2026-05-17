import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/prompts/**/*'],
  },
};

export default nextConfig;
