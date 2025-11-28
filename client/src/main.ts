/**
 * @file client/src/main.ts
 * @description 客户端入口：小程序应用初始化与 UI 库注册
 */
import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPlus from 'uview-plus';

export function createApp() {
  const app = createSSRApp(App);
  
  app.use(uviewPlus);
  
  return {
    app,
  };
}