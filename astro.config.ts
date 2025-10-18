// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import partytown from "@astrojs/partytown";

export default defineConfig({
  integrations: [
    icon(),
    (await import("@playform/compress")).default(),
    partytown(),
  ],

  vite: {
    build: {
      sourcemap: true,
    },
    css: {
      devSourcemap: true,
    },
    plugins: [tailwindcss()],
  },

  experimental: {
    preserveScriptOrder: true,
  },
});
