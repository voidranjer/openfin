import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  /* Custom config for building Chrome extension files */
  build: {
    rollupOptions: {
      input: {
        // Main app
        main: resolve(__dirname, 'index.html'),
        // Chrome extension files
        background: resolve(__dirname, 'src/chrome/background.ts'),
        content: resolve(__dirname, 'src/chrome/content.ts'),
        bridge: resolve(__dirname, 'src/chrome/bridge.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep chrome extension files in root of dist/
          if (['background', 'content', 'bridge'].includes(chunkInfo.name as string)) {
            return 'chrome/[name].js'
          }
          // Other files go in assets/
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
