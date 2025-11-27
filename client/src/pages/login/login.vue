// [登录页面] 微信一键授权登录与身份校验界面
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
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

const handleLogin = () => {

  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      console.log('获取code成功:', loginRes.code);
      
      try {

        const res: any = await uni.request({
          url: `${BASE_URL}/auth/login`,
          method: 'POST',
          data: { code: loginRes.code }
        })

        if (res.data && res.data.token) {
   
          uni.setStorageSync('token', res.data.token)
          uni.showToast({ title: '登录成功', icon: 'success' })
          
  
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
.wrap { padding: 100rpx 50rpx; display: flex; flex-direction: column; align-items: center; }
.logo-box { margin-bottom: 100rpx; display: flex; flex-direction: column; align-items: center; }
.title { font-size: 40rpx; font-weight: bold; margin-top: 20rpx; }
</style>