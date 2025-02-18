import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: './',
  plugins: [svgr({
    exportAsDefault: true,
    svgrOptions: {
      icon: true,
      svgoConfig: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false
          }
        ]
      }
    }
  }), react()],
  build: {
    cache: true,
    target: 'es2020',
    assetsDir: '',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false, // Tắt sourcemap
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        manualChunks: {
          vendor: ['react', 'react-dom'] // Tách các thư viện lớn thành chunk riêng
        },
      },
    },
    modulePreload: {
      polyfill: true,
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Tắt báo cáo kích thước nén để tăng tốc độ build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'], // Loại bỏ console.log
        passes: 2 // Thêm passes để tối ưu hóa nhiều hơn
      },
      format: {
        comments: false
      },
      mangle: {
        toplevel: true // Rút gọn tên biến ở mức cao nhất
      }
    },
  },
})