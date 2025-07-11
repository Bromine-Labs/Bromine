// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import icon from "astro-icon"

import cloudflare from "@astrojs/cloudflare"

import partytown from "@astrojs/partytown";

// import netlify from "@astrojs/netlify";

export default defineConfig({
  integrations: [icon(), (await import("@playform/compress")).default(), partytown()],

  vite: {
    build: {
      sourcemap: true, // enable production source maps
    },
    css: {
      devSourcemap: true, // enable CSS source maps during development
    },
    plugins: [tailwindcss()],
  },

  // output: "static",
  // adapter: cloudflare({
  //   imageService: "compile",
  // }),
  experimental: {
    preserveScriptOrder: true,
  },
})
