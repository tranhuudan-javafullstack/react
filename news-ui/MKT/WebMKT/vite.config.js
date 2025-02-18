import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
export default defineConfig({
  base: '/resource/owner/',
  plugins: [svgr({ exportAsDefault: true }), react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    modulePreload: {
      polyfill: true,
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },
})