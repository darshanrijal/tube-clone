import type { NextConfig } from "next";
import { env } from "./src/env";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "image.mux.com",
        protocol: "https",
      },
      {
        hostname: `${env.UPLOADTHING_APP_ID}.ufs.sh`,
        pathname: "/f/*",
        protocol: "https",
      },
    ],
  },
  allowedDevOrigins: ["pika-tough-routinely.ngrok-free.app"],
};

export default nextConfig;
