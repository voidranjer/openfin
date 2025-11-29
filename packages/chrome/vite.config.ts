import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

// Merges the base manifest with the platform-specific manifest.
function mergeManifests(target) {
  // Read the shared configuration (icons, content scripts, permissions)
  const base = JSON.parse(fs.readFileSync("./manifest.base.json", "utf-8"));
  
  // Read platform-specific overrides (background scripts vs service workers, IDs)
  const specific = JSON.parse(fs.readFileSync(`./manifest.${target}.json`, "utf-8"));
  
  // Merge them
  return { ...base, ...specific };
}

export default defineConfig(({ mode }) => {
  // Default to 'chrome' if the target env var is not set
  const target = process.env.TARGET || "chrome";

  return {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      // Separate output directories to avoid overwriting builds
      // e.g., dist/chrome or dist/firefox
      outDir: `dist/${target}`,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          background: resolve(__dirname, "src/background.ts"),
          bridge: resolve(__dirname, "src/bridge.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    plugins: [
      {
        name: "generate-manifest",
        /**
         * Custom plugin to generate the manifest.json file at build time.
         * This ensures the correct manifest version is bundled for the specific browser.
         */
        closeBundle() {
          const manifest = mergeManifests(target);
          fs.writeFileSync(
            `dist/${target}/manifest.json`,
            JSON.stringify(manifest, null, 2)
          );
        },
      },
    ],
  };
});
