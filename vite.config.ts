import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Reference-only design asset; avoid watcher EBUSY when the file is locked by OS/viewer
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
    watch: {
      ignored: [
        "**/public/assets/adventure/landing-classic-target.png",
        "**/backend/**/__pycache__/**",
        "**/.venv/**",
      ],
    },
  },
})
