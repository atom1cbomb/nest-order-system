/**
 * @file admin/src/views/Login.vue
 * @description 系统登录页面，处理管理员身份验证与 Token 存储
 */
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="title-box">
        <img src="/logo.png" class="logo" alt="logo" />
        <h2 class="title">点餐管理系统</h2>
      </div>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号" 
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            show-password
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button type="primary" :loading="loading" class="login-btn" size="large" @click="handleLogin">
          立即登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">


import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

// 表单数据模型
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 执行登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求延迟
      setTimeout(() => {
        loading.value = false
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          // 存储 Token 并跳转
          localStorage.setItem('admin_token', 'mock-token-123')
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error('账号或密码错误')
        }
      }, 1000)
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #2b32b2 0%, #1488cc 100%);
}

.login-card {
  width: 400px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.title-box {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  color: #333;
  font-weight: 600;
  margin: 0;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  letter-spacing: 2px;
}
</style>