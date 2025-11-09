import { defineConfig } from "vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  /* import aliases */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  /* Use relative paths for Chrome extension */
  // Remove if unecessary
  // base: "./",

  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        bridge: resolve(__dirname, "src/bridge.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep chrome extension files in chrome/ folder
          if (["background", "bridge"].includes(chunkInfo.name as string)) {
            return "[name].js";
          }
          // Main app files go in assets/
          return "assets/[name]-[hash].js";
        },
        assetFileNames: () => {
          // Keep assets organized
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    // Ensure relative paths work correctly in the extension
    // assetsDir: "assets",
  },
});
