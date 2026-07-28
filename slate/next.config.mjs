import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": __dirname,
    }
    return config
  },
}

export default nextConfig
