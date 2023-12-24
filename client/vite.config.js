import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* INFO
  - Kirúgásnál is törölje a socket ID-t a tömbből !!
*/

/* CONFIG */
// const serverAddress = "https://3.253.24.47:3001";
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
