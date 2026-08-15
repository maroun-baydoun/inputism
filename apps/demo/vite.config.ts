import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { demoCodePlugin } from "./src/demo-code-plugin";
import { snippets } from "./src/snippets";

export default defineConfig({
  plugins: [tailwindcss(), demoCodePlugin(snippets)],
  resolve: {
    alias: {
      "inputism/element": fileURLToPath(
        new URL("../../packages/inputism/src/element.ts", import.meta.url),
      ),
      "inputism/html": fileURLToPath(
        new URL("../../packages/inputism/src/html.ts", import.meta.url),
      ),
      "inputism/source": fileURLToPath(
        new URL("../../packages/inputism/src/source.ts", import.meta.url),
      ),
    },
  },
});
