import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  /* import aliases */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  /*  NOTE: IMPORTANT!!! Use relative paths for Chrome extension - sidePanel (./index.js in Network request) */
  base: "./",

  /* Custom config for building Chrome extension files */
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      // output: {
      //   entryFileNames: (chunkInfo) => {
      //     // Keep chrome extension files in chrome/ folder
      //     if (
      //       ["background", "content", "bridge"].includes(
      //         chunkInfo.name as string
      //       )
      //     ) {
      //       return "chrome/[name].js";
      //     }
      //     // Main app files go in assets/
      //     return "assets/[name]-[hash].js";
      //   },
      //   assetFileNames: () => {
      //     // Keep assets organized
      //     return "assets/[name]-[hash][extname]";
      //   },
      // },
    },
    // Ensure relative paths work correctly in the extension
    // assetsDir: "assets",
  },
});
