import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["node-cron", "exceljs", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
