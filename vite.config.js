import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Root-absolute base: served at the domain root on Cloudflare Pages, so deep
  // links like /conflicts resolve assets correctly (relative base broke refresh).
  base: '/',
  css: {
    postcss: {
      plugins: [tailwindcss()],
    }
  }
})
