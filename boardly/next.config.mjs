const path = require("path");

const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "./");
    return config;
  },
};

export default nextConfig;
