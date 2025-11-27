import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 告诉 Vite：所有以 /api 开头的请求，都帮我转发给后端
      '/api': {
        target: 'http://localhost:3000', // 后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀再发给后端
      },
    },
  },
})