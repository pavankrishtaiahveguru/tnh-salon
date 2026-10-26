/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
      ? (() => {
          const mediaUrl = new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL);
          if (mediaUrl.protocol !== "https:") return [];
          return [
            {
              protocol: "https",
              hostname: mediaUrl.hostname,
              port: mediaUrl.port,
              pathname: `${mediaUrl.pathname.replace(/\/+$/, "")}/**`,
            },
          ];
        })()
      : [],
  },

  async redirects() {
    return [
      {
        source: "/booking",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
