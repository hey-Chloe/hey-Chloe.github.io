import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";
if (basePath && (!/^\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)*$/.test(basePath) || basePath.split('/').some(segment => segment === '.' || segment === '..'))) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must be an absolute path without a trailing slash.");
}
const nextConfig: NextConfig = {
  output: "export",
  experimental: { globalNotFound: true },
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
