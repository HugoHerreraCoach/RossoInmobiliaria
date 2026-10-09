import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El material de obra pesa gigas: nunca entra al bundle ni al despliegue.
  outputFileTracingExcludes: { "*": ["Recursos/**"] },
};

export default nextConfig;
