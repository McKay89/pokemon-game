import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        /*target: "http://pserver.mckay-projects.com",*/
        /*target: "http://84.3.230.1:3001",*/
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
