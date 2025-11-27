// [根组件] 后台管理系统标准布局（侧边栏+顶栏）容器
<template>
  <div class="layout-container">
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
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="navbar-right">
          <el-dropdown>
            <span class="avatar-wrapper">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Menu, Food, List, Ticket, CaretBottom } from '@element-plus/icons-vue'
import { io } from "socket.io-client";
import { ElNotification } from 'element-plus'

// 连接 WebSocket
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true
});

onMounted(() => {
  // 1. 连接成功
  socket.on('connect', () => {
    console.log('✅ [Admin] WebSocket 连接成功！ID:', socket.id);
  });

  // 2. 监听新订单 (带桌号)
  socket.on('newOrder', (data: any) => {
    console.log('📦 [Admin] 收到新订单:', data);
    
    ElNotification({
      title: '🔔 新订单提醒',
      message: `[${data.tableNumber || '自提'}] 金额：¥${(data.totalPrice / 100).toFixed(2)}`,
      type: 'success',
      duration: 0, // 不自动关闭
      position: 'bottom-right'
    })
  });
})

onUnmounted(() => {
  if(socket) socket.disconnect();
})
</script>

<style>
/* --- 全局重置 --- */
body { 
  margin: 0; 
  padding: 0; 
  height: 100%; 
  overflow: hidden; 
  background-color: #f0f2f5; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
}
#app { height: 100%; }

/* --- 布局容器 --- */
.layout-container { display: flex; height: 100vh; width: 100vw; }

/* --- 左侧 Sidebar --- */
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

/* --- Logo 区域 --- */
.logo-box {
  height: 64px; /* 高度微调 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: #2b3649;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.sidebar-logo {
  width: 30px;
  height: 30px;
  margin-right: 12px;
  display: block;
  object-fit: contain;
}

.logo-text { 
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1;
  display: block;
  padding-top: 2px; 
}

/* --- 菜单样式修复 (强制居中对齐) --- */
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
  text-align: center;
  font-size: 18px;
  margin-right: 12px;
  vertical-align: middle;
  color: inherit;
  transform: translateY(-1px);
}

.el-menu-item span {
  font-size: 14px;
  letter-spacing: 1px;
  vertical-align: middle;
}

/* --- 右侧 Wrapper --- */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #f0f2f5;
  text-align: left;
}

/* --- 顶部 Header --- */
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

/* --- 主内容区 --- */
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

/* --- 页面切换动画 --- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>