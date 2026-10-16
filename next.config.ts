import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/webhooks/stripe": ["./public/logo.jpg", "./assets/fonts/NotoSans-Regular.ttf", "./assets/fonts/NotoSans-Bold.ttf"],
  },
};

export default nextConfig;
