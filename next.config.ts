import type { NextConfig } from "next";

function minioHostname(): string | undefined {
  try {
    return new URL(process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? "").hostname;
  } catch {
    return undefined;
  }
}

const host = minioHostname();

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: host ? [{ protocol: "https", hostname: host }] : [],
  },
};

export default nextConfig;
