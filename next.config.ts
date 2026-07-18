import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All prototype imagery is local. Avoid the Cloudflare image endpoint so
  // local vinext does not require an ASSETS binding just to render a page.
  images: { unoptimized: true },
};

export default nextConfig;
