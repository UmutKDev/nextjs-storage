import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const connectSrc = ["'self'", "https:"];
    if (!isProd) {
      connectSrc.push("http://localhost:8080");
      connectSrc.push("http://127.0.0.1:8080");
    }
    if (apiUrl) {
      try {
        const parsed = new URL(apiUrl);
        connectSrc.push(parsed.origin);
      } catch {
        // ignore invalid API URL
      }
    }

    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "frame-src 'self' https: blob:",
          "form-action 'self'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' blob:",
          `connect-src ${connectSrc.join(" ")}`,
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
        ].join("; "),
      },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
