// [点餐首页] 扫码选桌、菜单浏览与购物车结算主界面
<template>
  <view class="u-wrap">
    <view class="shop-header">
      <view class="shop-info">
        <text class="shop-name">餐饮旗舰店</text>
        <view class="table-tag" @click="showTablePopup = true">
          <u-icon name="map-fill" color="#2979ff" size="14"></u-icon>
          <text class="table-text">桌号: {{ tableNumber || '请选择' }}</text>
          <u-icon name="arrow-down" color="#999" size="12"></u-icon>
        </view>
      </view>
    </view>

    <view class="u-menu-wrap">
      <scroll-view scroll-y class="u-tab-view menu-scroll-view">
        <view v-for="(item, index) in categories" :key="item.id" class="u-tab-item"
          :class="{ 'u-tab-item-active': currentCategoryIndex === index }" @tap="switchMenu(index)">
          <text class="u-line-1">{{ item.name }}</text>
        </view>
      </scroll-view>

      <scroll-view scroll-y class="right-box" :scroll-into-view="toViewId">
        <view class="page-view">
          <view class="class-item" :id="'category-' + index" v-for="(category, index) in categories" :key="category.id">
            <view class="item-title"><text>{{ category.name }}</text></view>
            <view class="item-container">
              <view class="thumb-box" v-for="goods in category.products" :key="goods.id">
                <image class="item-menu-image" :src="goods.image || '/static/images/default.png'" mode="aspectFill"></image>
                <view class="item-menu-name">
                  <text class="u-line-1" style="font-weight: bold; font-size: 30rpx;">{{ goods.name }}</text>
                  <view style="color: #999; font-size: 24rpx; margin-top: 5rpx;">{{ goods.description || '暂无描述' }}</view>
                  <view style="display: flex; justify-content: space-between; align-items: center; margin-top: 15rpx;">
                    <text style="color: #fa3534; font-weight: bold;">¥ {{ (goods.price / 100).toFixed(2) }}</text>
                    <u-icon name="plus-circle-fill" color="#2979ff" size="28" @click="addToCart(goods)"></u-icon>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view style="height: 120rpx;"></view>
        </view>
      </scroll-view>
    </view>

    <view class="cart-bar">
      <view class="cart-left">
        <u-icon name="shopping-cart-fill" color="#2979ff" size="36"></u-icon>
        <text style="margin-left: 20rpx; font-weight: bold; font-size: 36rpx;">¥ {{ (totalPrice / 100).toFixed(2) }}</text>
        <text style="margin-left: 20rpx; font-size: 24rpx; color: #666;">共 {{ totalCount }} 件</text>
      </view>
      <view class="cart-right" @click="handlePay">去结算</view>
    </view>

    <u-popup :show="showTablePopup" mode="bottom" :round="16" :closeOnClickOverlay="false">
      <view class="table-popup-content">
        <view class="popup-header">
          <text class="popup-title">请选择您的桌号</text>
          <text class="popup-subtitle">请核对桌上的号码牌</text>
        </view>
        
        <scroll-view scroll-y style="max-height: 600rpx;">
          <view class="table-grid">
            <view 
              v-for="item in tableList" 
              :key="item.id" 
              class="table-item"
              :class="{ 'active': tempTableNumber === item.name }"
              @click="tempTableNumber = item.name"
            >
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
        
        <view class="btn-box">
          <u-button 
            type="primary" 
            :text="tempTableNumber ? `确认 (${tempTableNumber})` : '请选择'" 
            shape="circle" 
            size="large"
            :disabled="!tempTableNumber"
            color="linear-gradient(to right, #2979ff, #65c7f7)"
            @click="confirmTable"
          ></u-button>
        </view>
      </view>
    </u-popup>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

const categories = ref<any[]>([])
const tableList = ref<any[]>([]) 
const currentCategoryIndex = ref(0)
const toViewId = ref('')
const cart = ref<any[]>([])

const tableNumber = ref('') 
const tempTableNumber = ref('') 
const showTablePopup = ref(false)

onLoad((options: any) => {
  if (options && options.table) {
    tableNumber.value = options.table
    tempTableNumber.value = options.table
    showTablePopup.value = false
  } else {
    showTablePopup.value = true
  }
})

const confirmTable = () => {
  if (!tempTableNumber.value) return
  tableNumber.value = tempTableNumber.value
  showTablePopup.value = false
  uni.showToast({ title: `已选 ${tableNumber.value}`, icon: 'none' })
}

const fetchData = async () => {
  try {
    const [catRes, prodRes, tableRes] = await Promise.all([
      uni.request({ url: `${BASE_URL}/categories` }),
      uni.request({ url: `${BASE_URL}/products` }),
      uni.request({ url: `${BASE_URL}/tables` }) 
    ])
    
    const cats = (catRes.data as any) || []
    const prods = (prodRes.data as any) || []
    tableList.value = (tableRes.data as any) || [] 
    
    categories.value = cats.map((c: any) => ({
      ...c,
      products: prods.filter((p: any) => p.categoryId === c.id)
    }))
  } catch (e) {
    console.error(e)
  }
}

const switchMenu = (index: number) => {
  if (currentCategoryIndex.value === index) return
  currentCategoryIndex.value = index
  toViewId.value = 'category-' + index
}
const onRightScroll = (e: any) => {}

const addToCart = (goods: any) => {
  cart.value.push(goods)
  uni.showToast({ title: '已加入', icon: 'success', duration: 500 })
}

const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + item.price, 0))
const totalCount = computed(() => cart.value.length)

const handlePay = () => {
  if (cart.value.length === 0) return
  if (!tableNumber.value) { showTablePopup.value = true; return }

  uni.showModal({
    title: '确认下单',
    content: `桌号：${tableNumber.value}\n共需支付 ${(totalPrice.value / 100).toFixed(2)} 元`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '提交中...' })
        try {
          await uni.request({
            url: `${BASE_URL}/orders`,
            method: 'POST',
            header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
            data: {
              totalPrice: totalPrice.value,
              items: cart.value,
              tableNumber: tableNumber.value
            }
          })
          cart.value = []
          uni.showToast({ title: '下单成功', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '下单失败', icon: 'error' })
        } finally { uni.hideLoading() }
      }
    }
  })
}

onMounted(() => fetchData())
</script>

<style lang="scss">
@import 'uview-plus/theme.scss';
.u-wrap { height: 100vh; display: flex; flex-direction: column; }


.shop-header {
  background: #fff; padding: 20rpx 30rpx; border-bottom: 1px solid #f5f5f5;
  .shop-info {
    display: flex; justify-content: space-between; align-items: center;
    .shop-name { font-weight: bold; font-size: 32rpx; color: #333; }
    .table-tag { display: flex; align-items: center; background: #f0f7ff; padding: 10rpx 20rpx; border-radius: 30rpx; .table-text { font-size: 26rpx; color: #2979ff; margin: 0 10rpx; font-weight: bold; } }
  }
}

.u-menu-wrap { flex: 1; display: flex; overflow: hidden; }
.u-tab-view { width: 200rpx; height: 100%; background-color: #f6f6f6; }
.u-tab-item { height: 110rpx; background: #f6f6f6; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: #444; border-bottom: 1px solid #eee; }
.u-tab-item-active { background: #fff; color: #000; font-weight: 600; border-left: 6rpx solid #2979ff; position: relative; }
.right-box { background-color: #fff; flex: 1; }
.class-item { background-color: #fff; padding: 16rpx; border-radius: 8rpx; }
.item-title { font-size: 26rpx; color: #303133; font-weight: bold; padding: 20rpx 0; }
.thumb-box { width: 100%; display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1px solid #f8f8f8; }
.item-menu-image { width: 120rpx; height: 120rpx; border-radius: 12rpx; margin-right: 20rpx; }
.item-menu-name { flex: 1; }
.cart-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; border-top: 1px solid #eee; display: flex; align-items: center; padding: 0 30rpx; z-index: 99; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.cart-left { flex: 1; display: flex; align-items: center; }
.cart-right { width: 200rpx; height: 70rpx; background: #2979ff; color: #fff; text-align: center; line-height: 70rpx; border-radius: 35rpx; font-size: 28rpx; }

.table-popup-content {
  padding: 50rpx 40rpx; display: flex; flex-direction: column; align-items: center;
  .popup-header { text-align: center; margin-bottom: 40rpx; }
  .popup-title { font-size: 40rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; display: block; }
  .popup-subtitle { font-size: 26rpx; color: #999; }
  

  .table-grid {
    display: flex; flex-wrap: wrap; justify-content: flex-start; width: 100%; margin-bottom: 40rpx;
    .table-item {
      width: 30%; height: 80rpx; margin-bottom: 20rpx; margin-right: 3.33%; 
      background: #f5f7fa; border-radius: 12rpx; 
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: #333; font-size: 30rpx;
      border: 2rpx solid transparent; transition: all 0.2s;
      
      &:nth-child(3n) { margin-right: 0; } 
      
      &.active {
        background: #e6f1ff; color: #2979ff; border-color: #2979ff;
      }
    }
  }
  .btn-box { width: 100%; }
}
</style>