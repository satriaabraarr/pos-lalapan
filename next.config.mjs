/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  allowedDevOrigins: ["192.168.18.9"],
};
export default nextConfig;
