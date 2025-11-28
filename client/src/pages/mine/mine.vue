/**
 * @file client/src/pages/mine/mine.vue
 * @description 个人中心页面，展示用户信息、订单入口与设置项（uni-app）
 */
<template>
  <view class="wrap">
    <view class="header-bg">
      <view class="user-info-box">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill" class="avatar"></image>
        </button>
        
        <view class="nickname-box">
           <input 
             type="nickname" 
             v-model="userInfo.nickname" 
             placeholder="点击设置昵称" 
             placeholder-style="color: rgba(255,255,255,0.8); font-size: 32rpx;" 
             class="nickname-input"
             @blur="updateProfile" 
           />
           <u-icon name="edit-pen" color="#fff" size="16" style="margin-left: 10rpx; opacity: 0.8;"></u-icon>
        </view>
        
        <view class="id-text" @click="copyId">
          ID: {{ getVipNo(userInfo) }}
          <u-icon name="file-text" color="rgba(255,255,255,0.6)" size="12" style="margin-left: 10rpx;"></u-icon>
        </view>
      </view>
    </view>

    <view class="content-card">
      <u-cell-group :border="false">
        <u-cell icon="order" iconStyle="color: #2979ff" title="我的订单" isLink @click="goToOrder"></u-cell>
        <u-cell icon="server-fill" iconStyle="color: #ff9900" title="联系客服" isLink @click="handleContact"></u-cell>
        <u-cell icon="setting" iconStyle="color: #909399" title="设置" isLink @click="handleSettings"></u-cell>
      </u-cell-group>
      
      <view style="margin-top: 60rpx; padding: 0 40rpx;">
        <u-button type="error" shape="circle" plain @click="handleLogout">退出登录</u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 环境变量配置：获取后端服务基地址
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

// 响应式状态定义：存储当前用户信息
const userInfo = ref<any>({})

// 工具函数：格式化用户ID显示（截取OpenID后8位）
const getVipNo = (user: any) => {
  if (!user.openid) return '未登录'
  return user.openid.substring(user.openid.length - 8).toUpperCase()
}

// 交互逻辑：复制用户ID到剪贴板
const copyId = () => {
  if (!userInfo.value.openid) return
  uni.setClipboardData({
    data: userInfo.value.openid,
    success: () => uni.showToast({ title: 'ID已复制', icon: 'none' })
  })
}

// 导航逻辑：跳转至订单页面
const goToOrder = () => {
  uni.switchTab({ url: '/pages/order/order' })
}

// 业务逻辑：联系客服（拨打电话）
const handleContact = () => {
  uni.makePhoneCall({
    phoneNumber: '13800138000' // 此处填写实际客服号码
  })
}

// 业务逻辑：系统设置菜单
const handleSettings = () => {
  uni.showActionSheet({
    itemList: ['清除缓存', '关于版本'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 执行清除缓存逻辑
        uni.removeStorageSync('my_cart_v1')
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      } else if (res.tapIndex === 1) {
        // 显示版本信息
        uni.showModal({
          title: '关于',
          content: '当前版本：V1.0.0\n技术支持：基于NestJS全栈开发',
          showCancel: false
        })
      }
    }
  })
}

// 数据请求：获取最新的用户个人资料
const getProfile = async () => {
  const token = uni.getStorageSync('token')
  if (!token) return
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/users/profile`,
      header: { Authorization: `Bearer ${token}` }
    })
    if (res.statusCode === 200) userInfo.value = res.data
  } catch (e) {
    console.error('Fetch profile failed:', e)
  }
}

// 业务逻辑：处理头像选择与上传
const onChooseAvatar = (e: any) => {
  const tempFilePath = e.detail.avatarUrl
  // 1. 立即上传图片到服务器
  uni.uploadFile({
    url: `${BASE_URL}/upload`,
    filePath: tempFilePath,
    name: 'file',
    success: (uploadRes) => {
      try {
        // 2. 解析服务器返回的永久URL
        const data = JSON.parse(uploadRes.data)
        if (data.url) {
          userInfo.value.avatar = data.url
          // 3. 更新用户资料库
          updateProfile()
        }
      } catch (err) {
        uni.showToast({ title: '头像上传失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    }
  })
}

// 数据请求：提交更新后的用户资料至后端
const updateProfile = async () => {
  // 仅在昵称或头像有效时提交
  if (!userInfo.value.nickname && !userInfo.value.avatar) return
  
  try {
    await uni.request({
      url: `${BASE_URL}/users/profile`,
      method: 'PATCH',
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
      data: {
        nickname: userInfo.value.nickname,
        avatar: userInfo.value.avatar
      }
    })
    uni.showToast({ title: '资料已保存', icon: 'none' })
  } catch (e) {
    console.error('Update profile failed:', e)
  }
}

// 业务逻辑：退出登录并重置状态
const handleLogout = () => {
  uni.removeStorageSync('token')
  uni.reLaunch({ url: '/pages/login/login' })
}

// 页面显示生命周期：自动加载数据
onShow(() => {
  getProfile()
})
</script>

<style lang="scss" scoped>
.wrap { background-color: #f5f7fa; min-height: 100vh; }

/* 顶部背景区域样式 */
.header-bg {
  background: linear-gradient(135deg, #2979ff 0%, #65c7f7 100%);
  height: 520rpx;
  padding-top: 160rpx; 
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  /* 移除 align-items: center 以防止高度变化时的抖动 */
}

/* 用户信息容器样式 */
.user-info-box {
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  color: #fff;
  
  /* 头像按钮容器 */
  .avatar-btn {
    width: 150rpx; height: 150rpx; border-radius: 50%; 
    padding: 0; margin: 0; background: none; position: relative; 
    border: 6rpx solid rgba(255,255,255,0.3);
    box-shadow: 0 10rpx 20rpx rgba(0,0,0,0.1); 
    &::after { border: none; }
  }
  
  /* 头像图片 */
  .avatar { width: 100%; height: 100%; border-radius: 50%; }

  
  /* 昵称编辑区域 */
  .nickname-box {
    margin-top: 30rpx; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    
    .nickname-input { 
      text-align: center; 
      color: #fff; 
      font-size: 38rpx; 
      font-weight: 600; 
      width: auto;
      min-width: 100rpx;
      background: transparent;
    }
  }
  
  /* 用户ID显示区域 */
  .id-text {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.85);
    font-family: Helvetica, sans-serif;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
  }
}

/* 功能卡片区域样式 */
.content-card {
  background: #fff;
  margin: -60rpx 30rpx 0; 
  border-radius: 24rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 30rpx rgba(0,0,0,0.04);
  position: relative;
  z-index: 1;
}
</style>