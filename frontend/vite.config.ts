import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Use classic runtime for React to avoid CSP issues
    jsxRuntime: 'classic',
  })],
  server: {
    // Configure HMR settings
    hmr: {
      overlay: false, // Disable the error overlay
    },
    // Keep alive timeout
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  // Optimize build
  build: {
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
})
