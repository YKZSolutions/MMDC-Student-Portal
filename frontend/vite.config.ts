/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import tanstackRouter from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    checker({
      typescript: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/notifications': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/enrollment': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/billing': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/modules': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/enrollments': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
