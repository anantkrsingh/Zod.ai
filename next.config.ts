import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config)=>{
    config.resolve.alias.canvas = false;
    return config;
  },
  devIndicators:false,
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"imgur.com"
      },
      {
        protocol:"https",
        hostname:"img.clerk.com"
      }
    ]
  }
};

export default nextConfig;
