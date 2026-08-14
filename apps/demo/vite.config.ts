import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      inputism: fileURLToPath(
        new URL("../../packages/inputism/src/index.ts", import.meta.url),
      ),
    },
  },
});
