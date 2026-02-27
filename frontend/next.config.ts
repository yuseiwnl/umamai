import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    webpack(config) {
    // Disable CSS minification
    config.optimization.minimizer = config.optimization.minimizer.filter((fn: any) => {
      return !fn.toString().includes("CssMinimizerPlugin");
    });

    return config;
  },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "rimage.gnst.jp",
            },

            {
                protocol: "https",
                hostname: "bigdxvmubvydsttabrjx.supabase.co",
            },

            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    }
};

export default nextConfig;
