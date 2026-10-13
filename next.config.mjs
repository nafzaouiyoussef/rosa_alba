/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" }
    ]
  },
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      { source: "/products/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/(logo.png|logo.svg|og.jpg)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] }
    ];
  },
  experimental: { serverActions: { bodySizeLimit: "6mb" } }
};
export default nextConfig;
