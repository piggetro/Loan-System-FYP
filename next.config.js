/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    localeDetection: false,
  },
  // externals: ["@node-rs/argon2", "@node-rs/bcrypt"],
};

export default config;
