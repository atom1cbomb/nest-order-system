// [入口文件] 小程序应用初始化与UI库注册
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