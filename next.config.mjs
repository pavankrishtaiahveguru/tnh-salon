/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/eumjdehq/**",
      },
    ],
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
