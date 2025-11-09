import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        types: resolve(__dirname, "src/types/index.ts"),
        utils: resolve(__dirname, "src/utils.ts"),
      },
      name: "@openbanker/core",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
  },

  /* import aliases */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
