/**
 * @file admin/src/main.ts
 * @description 后台管理入口：创建 Vue 应用并挂载全局插件
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router' 

const app = createApp(App)

app.use(ElementPlus)
app.use(router) 

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')