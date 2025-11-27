// [订单列表] 历史订单查询与详情展示界面
<template>
  <view class="wrap">
  
    <view class="order-list">
      <view class="order-item" v-for="item in list" :key="item.id">
        <view class="header">
          <text>订单号: #{{ item.id }}</text>
          <text class="status red" v-if="item.status === 0">待接单</text>
          <text class="status orange" v-else-if="item.status === 1">制作中</text>
          <text class="status green" v-else>已完成</text>
        </view>
        
        <view class="body">
          <view v-for="(prod, idx) in item.items" :key="idx" class="prod-row">
            <text class="name">{{ prod.productName }}</text>
            <view class="row-right">
              <text class="unit-price">¥{{ (prod.price / 100).toFixed(2) }}</text>
            </view>
          </view>
        </view>
        
        <view class="footer">
          <text>合计: ¥{{ (item.totalPrice / 100).toFixed(2) }}</text>
        </view>
      </view>
    <u-empty v-if="list.length === 0" mode="order" text="暂无订单"marginTop="100"></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onHide, onUnload } from '@dcloudio/uni-app'

const list = ref<any[]>([])
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'
let timer: any = null 

const getOrders = async () => {
  try {

    const res = await uni.request({ 
      url: `${BASE_URL}/orders/mine`,
      header: { Authorization: `Bearer ${uni.getStorageSync('token')}` }
    })

    list.value = res.data as any[]
  } catch (e) {
    console.error(e)
  }
}

onShow(() => {
  getOrders()
  // 每 2 秒自动刷新一次 (伪实时)
  timer = setInterval(() => {
    getOrders()
  }, 2000)
})

// 页面隐藏或卸载时：销毁定时器 
const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onHide(() => {
  stopPolling()
})

onUnload(() => {
  stopPolling()
})


</script>

<style lang="scss" scoped>
.wrap { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 20rpx; }
.order-item {
  background: #fff; margin: 20rpx; padding: 20rpx; border-radius: 12rpx;
  .header { display: flex; justify-content: space-between; font-size: 28rpx; border-bottom: 1px solid #eee; padding-bottom: 15rpx; margin-bottom: 15rpx; }
  .status { font-weight: bold; }
  .red { color: #fa3534; } .orange { color: #ff9900; } .green { color: #19be6b; }

.prod-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 12rpx; 
  font-size: 28rpx; 
  color: #303133; 
  
  .name { font-weight: bold; }
  .row-right { display: flex; align-items: center; }
  .unit-price { margin-right: 20rpx; color: #666; font-size: 26rpx; } 
  .count { color: #999; font-size: 24rpx; }
}
  .footer { text-align: right; font-weight: bold; font-size: 30rpx; border-top: 1px solid #eee; padding-top: 15rpx; margin-top: 15rpx; }
}
</style>