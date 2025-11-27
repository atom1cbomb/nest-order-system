// [个人中心] 用户资料管理与常用功能入口界面
<template>
  <view class="wrap">
    <view class="header-bg">
      <view class="user-info-box">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill" class="avatar"></image>
          <view class="camera-icon"><u-icon name="camera-fill" color="#fff" size="12"></u-icon></view>
        </button>
        
        <view class="nickname-box">
           <input 
             type="nickname" 
             v-model="userInfo.nickname" 
             placeholder="点击设置昵称" 
             placeholder-style="color: rgba(255,255,255,0.7); font-size: 32rpx;" 
             class="nickname-input"
             @blur="updateProfile" 
           />
           <u-icon name="edit-pen" color="#fff" size="16" style="margin-left: 4rpx; opacity: 0.8;"></u-icon>
        </view>
        
        <view class="id-box" @click="copyId">
          <text class="id-label">ID：</text>
          <text class="id-text">{{ getVipNo(userInfo) }}</text>
          <u-icon name="file-text" color="rgba(255,255,255,0.6)" size="12" style="margin-left: 8rpx"></u-icon>
        </view>
      </view>
    </view>

    <view class="content-card">
      <u-cell-group :border="false">
        <u-cell icon="order" title="我的订单" isLink @click="goToOrder"></u-cell>
        <u-cell icon="map" title="收货地址" isLink label="暂未开发"></u-cell>
        <u-cell icon="server-fill" title="联系客服" isLink></u-cell>
        <u-cell icon="setting" title="设置" isLink></u-cell>
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

const userInfo = ref<any>({})
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'


const getVipNo = (user: any) => {
  if (!user.openid) return '888888' 
  // 截取 openid 的最后 8 位
  return user.openid.substring(user.openid.length - 8).toUpperCase()
}

const goToOrder = () => {
  uni.switchTab({ url: '/pages/order/order' })
}
const getProfile = async () => {
  const token = uni.getStorageSync('token')
  if (!token) return
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/users/profile`,
      header: { Authorization: `Bearer ${token}` }
    })
    if (res.statusCode === 200) userInfo.value = res.data
  } catch (e) {}
}
const onChooseAvatar = (e: any) => {
  userInfo.value.avatar = e.detail.avatarUrl
  updateProfile()
}
const updateProfile = async () => {
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
    uni.showToast({ title: '已保存', icon: 'none' })
  } catch (e) {}
}
const handleLogout = () => {
  uni.removeStorageSync('token')
  uni.reLaunch({ url: '/pages/login/login' })
}

const copyId = () => {
  if (!userInfo.value.openid) return
  uni.setClipboardData({
    data: userInfo.value.openid, // 或者 getVipNo(userInfo.value)
    success: () => uni.showToast({ title: 'ID已复制', icon: 'none' })
  })
}
onShow(() => {
  getProfile()
})
</script>

<style lang="scss" scoped>
.wrap { background-color: #f5f7fa; min-height: 100vh; }

.header-bg {
  background: linear-gradient(135deg, #2979ff 0%, #65c7f7 100%);
  height: 520rpx;        
  padding-top: 180rpx;   
  box-sizing: border-box; 
  display: flex;
  justify-content: center;
  align-items: flex-start; 
}

.user-info-box {
  display: flex; flex-direction: column; align-items: center; color: #fff;
  
  .avatar-btn {
    width: 140rpx; height: 140rpx; border-radius: 50%; 
    padding: 0; margin: 0; background: none; position: relative; 
    border: 4rpx solid rgba(255,255,255,0.4); 
    box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.1); 
    &::after { border: none; }
  }
  .avatar { width: 100%; height: 100%; border-radius: 50%; }

  .camera-icon { 
    position: absolute; bottom: 0; right: 0; 
    background: #2979ff; 
    border: 2rpx solid #fff; 
    border-radius: 50%; width: 36rpx; height: 36rpx; 
    display: flex; align-items: center; justify-content: center; 
  }
  

  .nickname-box {
    margin-top: 24rpx; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    
 
    .nickname-input { 
      text-align: center; 
      color: #fff; 
      font-size: 36rpx; 
      font-weight: 600; 
      width: 260rpx; 

      background: transparent;
    }
  }
  

  .id-box {
    margin-top: 16rpx;
    display: flex; align-items: center;
    opacity: 0.8; 
    background: rgba(0,0,0,0.1); 
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    
    .id-label {
      font-size: 25rpx; 
      color: rgba(255,255,255,0.8);
      margin-right: 8rpx;
      font-weight: bold;
    }
    
    .id-text {
      font-size: 24rpx; 
      color: #fff; 
      font-family: Helvetica, sans-serif; 
      letter-spacing: 1px;
    }
  }
}

.user-info-box {
  display: flex; flex-direction: column; align-items: center; color: #fff;
  
  .avatar-btn {
    width: 140rpx; height: 140rpx; border-radius: 50%; padding: 0; margin: 0; background: none; position: relative; border: 4rpx solid rgba(255,255,255,0.3);
    &::after { border: none; }
  }
  .avatar { width: 100%; height: 100%; border-radius: 50%; }
  .camera-icon { position: absolute; bottom: 0; right: 0; background: rgba(0,0,0,0.5); border-radius: 50%; width: 40rpx; height: 40rpx; display: flex; align-items: center; justify-content: center; }
  
  .nickname-box {
    margin-top: 20rpx; display: flex; align-items: center; font-size: 36rpx; font-weight: bold;
    input { text-align: center; width: 300rpx; color: #fff; }
  }
  
  .vip-tag {
    margin-top: 20rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 6rpx 24rpx; // 加宽一点
    border-radius: 30rpx;
    display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.3);
    
    .vip-text {
      font-size: 24rpx; color: #fff; margin-left: 10rpx; 
      letter-spacing: 2rpx; font-family: monospace; font-weight: bold;
    }
  }
}

.content-card {
  background: #fff;
  margin: -60rpx 30rpx 0; 
  border-radius: 20rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  position: relative; 
  z-index: 1;
}
</style>