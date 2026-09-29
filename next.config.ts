import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "https://webchat-robolingo.vercel.app",
  ],
};

export default nextConfig;
