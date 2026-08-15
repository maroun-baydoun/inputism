import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "inputism/core": fileURLToPath(
        new URL("../inputism/src/core.ts", import.meta.url),
      ),
      "inputism/source": fileURLToPath(
        new URL("../inputism/src/source.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
  },
});
