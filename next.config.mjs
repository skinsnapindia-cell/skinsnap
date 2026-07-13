/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      // llms.txt spec: raw-markdown variant of each guide at <url>.md
      { source: "/blog/:slug.md", destination: "/api/blog-md/:slug" },
    ];
  },
};

export default nextConfig;
