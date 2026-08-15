import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        core: fileURLToPath(new URL("./src/core.ts", import.meta.url)),
        source: fileURLToPath(new URL("./src/source.ts", import.meta.url)),
        html: fileURLToPath(new URL("./src/html.ts", import.meta.url)),
        element: fileURLToPath(new URL("./src/element.ts", import.meta.url)),
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
