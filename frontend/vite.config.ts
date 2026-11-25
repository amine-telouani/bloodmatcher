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
        "admin": resolve(root, 'pages/admin/index.html'),
        "donor-dashboard": resolve(root, 'pages/donor-dashboard/index.html'),
        "home": resolve(root, 'pages/home/index.html'),
        "hospital-dashboard": resolve(root, 'pages/hospital-dashboard/index.html'),
        "not-found": resolve(root, 'pages/not-found/index.html'),
        "register": resolve(root, 'pages/register/index.html'),
        "sign-in": resolve(root, 'pages/sign-in/index.html'),
        "uwlmheebsvj2qxnbeepldq": resolve(root, 'pages/uwlmheebsvj2qxnbeepldq/index.html'),
      },
    },
  },
})
