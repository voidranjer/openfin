import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  /* shadcn */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // Use relative paths for Chrome extension
  base: "./",

  /* Custom config for building Chrome extension files */
  build: {
    rollupOptions: {
      input: {
        // Main app (popup)
        main: resolve(__dirname, "index.html"),
        // Chrome extension files
        background: resolve(__dirname, "src/chrome/background.ts"),
        content: resolve(__dirname, "src/chrome/content.ts"),
        bridge: resolve(__dirname, "src/chrome/bridge.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep chrome extension files in chrome/ folder
          if (
            ["background", "content", "bridge"].includes(
              chunkInfo.name as string
            )
          ) {
            return "chrome/[name].js";
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
    assetsDir: "assets",
  },
});
