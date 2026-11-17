import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        "donor-dashboard": resolve(root, 'pages/donor-dashboard/index.html'),
        "forgot-password": resolve(root, 'pages/forgot-password/index.html'),
        "hospital-dashboard": resolve(root, 'pages/hospital-dashboard/index.html'),
        "register": resolve(root, 'pages/register/index.html'),
        "sign-in": resolve(root, 'pages/sign-in/index.html'),
        "untitled": resolve(root, 'pages/untitled/index.html'),
        "wjeedbjblqql3xaksgugw1": resolve(root, 'pages/wjeedbjblqql3xaksgugw1/index.html'),
      },
    },
  },
})
