import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/notes/javascript/concepts/typescript-types",
        destination: "/notes/learn/typescript#ts-types-cheatsheet",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
