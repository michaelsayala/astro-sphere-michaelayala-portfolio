import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"

export default defineConfig({
  site: "https://michaelsayala.com",

  integrations: [
    mdx(),
    solidJs(),
    tailwind({ applyBaseStyles: false })
  ],
})