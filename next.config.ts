import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "upload.wikimedia.org" },
      { hostname: "inaturalist-open-data.s3.amazonaws.com" },
      { hostname: "static.inaturalist.org" },
      { hostname: "www.iucnredlist.org" },
    ],
  },
};

export default nextConfig;
