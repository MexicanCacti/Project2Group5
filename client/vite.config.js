import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SERVER_PORT = process.env.SERVER_PORT || 8080;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 30
    },
    proxy: {
      "/gemini": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/user": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/googlephotos": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/character": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/character/upload": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/story": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      },
      "/characters": {
        target: "http://server:" + SERVER_PORT,
        changeOrigin: true,
      }
    },
  },
})
