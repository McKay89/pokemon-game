import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* CONFIG */
const serverAddress = "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  define: {
    "__SERVER_ADDRESS__": JSON.stringify(serverAddress)
  },
  server: {
    proxy: {
      "/api": {
        target: serverAddress,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
