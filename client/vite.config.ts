import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  // 强制预构建 uview-plus，防止报错
  optimizeDeps: {
    include: ['uview-plus']
  }
});