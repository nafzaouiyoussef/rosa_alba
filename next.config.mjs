/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: { serverActions: { bodySizeLimit: "6mb" } }
};
export default nextConfig;
