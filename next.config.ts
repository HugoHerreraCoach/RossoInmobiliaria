import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El material de obra pesa gigas: nunca entra al bundle ni al despliegue.
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ] }];
  },
  outputFileTracingExcludes: { "*": ["Recursos/**"] },
};

export default nextConfig;
