/**
 * @file App.vue
 * @description 应用程序根组件，负责布局结构与全局状态监听
 */
<template>
  <router-view v-if="route.path === '/login'" />

  <div v-else class="layout-container">
    
    <aside class="sidebar">
      <div class="logo-box">
        <span class="logo-text">点餐管理后台</span>
      </div>

      <el-menu
        router
        :default-active="$route.path"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        class="el-menu-vertical"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>数据看板</span>
        </el-menu-item>

        <el-menu-item index="/category">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        
        <el-menu-item index="/product">
          <el-icon><Food /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        
        <el-menu-item index="/table">
          <el-icon><Ticket /></el-icon>
          <span>桌号管理</span>
        </el-menu-item>

        <el-menu-item index="/order">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-wrapper">
      <header class="navbar">
        <div class="navbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>
              {{ $route.meta.title || '数据看板' }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="navbar-right">
          <el-dropdown>
            <span class="avatar-wrapper">
              <el-avatar :size="32" src="/logo.png" />
              <span class="username">管理员</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="app-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="$route.fullPath" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, Food, List, Ticket, CaretBottom, Odometer } from '@element-plus/icons-vue'
import { io, Socket } from "socket.io-client"
import { ElNotification, ElMessage } from 'element-plus'

// 路由与状态初始化
const router = useRouter()
const route = useRoute()
let socket: Socket | null = null

// 登出逻辑
const handleLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
  ElMessage.success('已退出登录')
}

// WebSocket 初始化
onMounted(() => {
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    transports: ['websocket'],
    reconnection: true
  })

  socket.on('connect', () => {
    console.log('✅ [System] WebSocket 服务已连接')
  })

  socket.on('newOrder', (data: any) => {
    console.log('📦 [Order] 收到新订单:', data)
    ElNotification({
      title: '🔔 新订单提醒',
      message: `[${data.tableNumber || '自提'}] 金额：¥${(data.totalPrice / 100).toFixed(2)}`,
      type: 'success',
      duration: 0,
      position: 'bottom-right'
    })
  })
})

// 资源清理
onUnmounted(() => {
  if(socket) {
    socket.disconnect()
  }
})
</script>

<style>
/* 全局样式定义 */
body { 
  margin: 0; 
  padding: 0; 
  height: 100%; 
  overflow: hidden; 
  background-color: #f0f2f5; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
}
#app { height: 100%; }

/* 主布局容器 */
.layout-container { display: flex; height: 100vh; width: 100vw; }

/* 侧边栏 */
.sidebar {
  width: 220px;
  background-color: #304156;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; 
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
  z-index: 10;
  text-align: left;
}

.logo-box {
  height: 64px;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: #2b3649;
  color: #fff;
}

.logo-text { 
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.el-menu-vertical { border-right: none !important; }

.el-menu-item {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start;
  height: 56px;
  padding-left: 24px !important;
}

.el-menu-item .el-icon {
  width: 24px;
  font-size: 18px;
  margin-right: 12px;
  color: inherit;
  transform: translateY(-1px);
}

/* 内容区 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #f0f2f5;
  text-align: left;
}

.navbar {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 9;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.username { margin: 0 6px 0 10px; font-weight: 500; }

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}
</style>