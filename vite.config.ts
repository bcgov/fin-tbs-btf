import vue from "@vitejs/plugin-vue";
import * as process from "node:process";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE || "",
  plugins: [vue()],
  test: {
    environment: "jsdom",
    deps: {
      inline: ["vuetify"],
    },
    setupFiles: ["./src/vitest.setup.ts"],
  },
});
