<template>
  <view class="wrap">
    <view class="logo-box">
      <u-icon name="fingerprint" color="#2979ff" size="80"></u-icon>
      <text class="title">欢迎点餐</text>
    </view>
    
    <u-button type="primary" shape="circle" @click="handleLogin">微信一键登录</u-button>
  </view>
</template>

<script setup lang="ts">
/**
 * 登录模块逻辑实现
 * 主要负责处理微信登录流程，获取用户凭证并与后端进行交互以完成身份验证。
 */
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

/**
 * 处理登录点击事件
 * 1. 调用 uni.login 获取微信临时登录凭证 (code)。
 * 2. 将 code 发送至后端 /auth/login 接口进行验证。
 * 3. 获取后端返回的 JWT Token 并存储至本地缓存。
 * 4. 登录成功后跳转至点餐首页。
 */
const handleLogin = () => {
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      console.log('获取code成功:', loginRes.code);
      
      try {
        // 发送登录请求
        const res: any = await uni.request({
          url: `${BASE_URL}/auth/login`,
          method: 'POST',
          data: { code: loginRes.code }
        })

        // 验证响应结果
        if (res.data && res.data.token) {
          // 持久化存储 Token
          uni.setStorageSync('token', res.data.token)
          uni.showToast({ title: '登录成功', icon: 'success' })
          
          // 延迟跳转以优化用户体验
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1000)
        }
      } catch (e) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
/* 页面容器样式 */
.wrap { 
  padding: 100rpx 50rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

/* Logo区域样式 */
.logo-box { 
  margin-bottom: 100rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

/* 标题文本样式 */
.title { 
  font-size: 40rpx; 
  font-weight: bold; 
  margin-top: 20rpx; 
}
</style>