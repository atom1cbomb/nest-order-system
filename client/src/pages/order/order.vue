/**
 * @file client/src/pages/order/order.vue
 * @description 我的订单页面，显示用户历史订单及实时状态（uni-app）
 */
<template>
  <view class="wrap">
    <u-navbar
      title="我的订单"
      :safeAreaInsetTop="true"
      :placeholder="true"
      bgColor="#fff"
      leftIcon=""
    ></u-navbar>
    
    <view class="order-list">
      <view class="order-item" v-for="item in list" :key="item.id">
        <view class="header">
          <text class="order-no">订单号 #{{ item.id }}</text>
          <text class="status red" v-if="item.status === 0">待接单</text>
          <text class="status orange" v-else-if="item.status === 1">制作中</text>
          <text class="status green" v-else>已完成</text>
        </view>
        
        <view class="divider"></view>
        
        <view class="body">
          <view v-for="(prod, idx) in item.items" :key="idx" class="prod-row">
            <text class="name">{{ prod.productName }}</text>
            <view class="row-right">
              <text class="count">x{{ prod.count }}</text>
            </view>
          </view>
        </view>
        
        <view class="footer">
          <text class="time">{{ formatTime(item.createTime) }}</text>
          <view class="total-box">
            <text class="label">合计</text>
            <text class="price">¥ {{ (item.totalPrice / 100).toFixed(2) }}</text>
          </view>
        </view>
      </view>
      
      <u-empty 
        v-if="list.length === 0" 
        mode="order" 
        text="暂无订单" 
        marginTop="100"
      ></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onHide, onUnload } from '@dcloudio/uni-app'

// 环境变量配置
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

// 响应式状态定义
const list = ref<any[]>([])
let timer: any = null 

// 时间格式化工具函数
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 获取订单列表数据
const getOrders = async () => {
  const token = uni.getStorageSync('token')
  if (!token) return
  
  try {
    const res: any = await uni.request({ 
      url: `${BASE_URL}/orders/mine`,
      header: { Authorization: `Bearer ${token}` }
    })
    if (res.statusCode === 200) {
      list.value = res.data
    }
  } catch (e) {
    console.error('Fetch orders failed:', e)
  }
}

// 页面显示生命周期：初始化数据并开启轮询
onShow(() => {
  getOrders()
  // 开启短轮询以实时更新订单状态
  timer = setInterval(() => {
    getOrders()
  }, 2000)
})

// 停止轮询逻辑
const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 页面隐藏或卸载生命周期：清理定时器
onHide(() => {
  stopPolling()
})

onUnload(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.wrap { 
  background-color: #f5f7fa; 
  min-height: 100vh; 
  padding-bottom: 20rpx; 
}

.order-item {
  background: #fff; 
  margin: 20rpx 20rpx 0; 
  padding: 30rpx; 
  border-radius: 16rpx;
  
  /* 头部样式 */
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 20rpx; 
  }
  .order-no { color: #909399; font-size: 26rpx; }
  .status { font-weight: bold; font-size: 28rpx; }
  .red { color: #fa3534; } 
  .orange { color: #ff9900; } 
  .green { color: #19be6b; }
  
  .divider { height: 1px; background: #f3f4f6; margin: 20rpx 0; }
  
  /* 内容列表样式 */
  .prod-row { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 12rpx; 
    font-size: 28rpx; 
    color: #303133; 
  }
  .count { color: #909399; font-size: 26rpx; }
  
  /* 底部统计样式 */
  .footer { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-top: 30rpx; 
    padding-top: 20rpx;
    border-top: 1px dashed #eee;
  }
  
  .time {
    font-size: 24rpx;
    color: #999;
  }

  .total-box {
    display: flex;
    align-items: baseline;
  }
  
  .label { font-size: 24rpx; color: #606266; margin-right: 10rpx; }
  .price { font-size: 36rpx; font-weight: bold; color: #303133; font-family: sans-serif; }
}
</style>