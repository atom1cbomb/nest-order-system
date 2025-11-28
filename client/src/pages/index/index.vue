/**
 * @file client/src/pages/index/index.vue
 * @description 点餐客户端主页面，展示分类、商品与购物车（uni-app）
 */
<template>
  <view class="u-wrap">
    <u-navbar
      title="店铺名"
      :safeAreaInsetTop="true"
      :placeholder="true"
      bgColor="#fff"
      leftIcon=""
    >
      <template #right>
        <view class="table-tag" @click="showTablePopup = true">
          <u-icon name="map-fill" color="#2979ff" size="12"></u-icon>
          <text class="table-text">{{ tableNumber || '选桌' }}</text>
          <u-icon name="arrow-down" color="#999" size="10"></u-icon>
        </view>
      </template>
    </u-navbar>

    <view class="u-menu-wrap">
      <scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view">
        <view v-for="(item, index) in categories" :key="item.id" class="u-tab-item"
          :class="{ 'u-tab-item-active': currentCategoryIndex === index }" @tap="switchMenu(index)">
          <text class="u-line-1">{{ item.name }}</text>
          <view v-if="getCategoryCount(item.id) > 0" class="category-badge">{{ getCategoryCount(item.id) }}</view>
        </view>
      </scroll-view>

      <scroll-view scroll-y class="right-box" :scroll-into-view="toViewId" @scroll="onRightScroll">
        <view class="page-view">
          <view class="class-item" :id="'category-' + index" v-for="(category, index) in categories" :key="category.id">
            <view class="item-title"><text>{{ category.name }}</text></view>
            <view class="item-container">
              <view class="thumb-box" v-for="(goods, index1) in category.products" :key="goods.id">
                <image class="item-menu-image" :src="goods.image || '/static/images/default.png'" mode="aspectFill"></image>
                
                <view class="item-menu-name">
                  <text class="u-line-1 goods-title">{{ goods.name }}</text>
                  
                  <view class="desc-text">{{ goods.description || '暂无描述' }}</view>
                  <view class="stock-text">库存: {{ goods.stock }}</view>

                  <view class="action-row">
                    <text class="price">¥ {{ (goods.price / 100).toFixed(2) }}</text>
                    
                    <view class="cart-control" v-if="goods.stock > 0">
                      <view v-if="getCartCount(goods.id) > 0" class="circle-btn minus" @click.stop="decreaseCart(goods)">
                        <u-icon name="minus" color="#2979ff" size="12" bold></u-icon>
                      </view>
                      <text v-if="getCartCount(goods.id) > 0" class="goods-num">{{ getCartCount(goods.id) }}</text>
                      <view class="circle-btn plus" @click.stop="addToCart(goods)">
                        <u-icon name="plus" color="#fff" size="12" bold></u-icon>
                      </view>
                    </view>
                    <text v-else class="sold-out-text">已售罄</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view style="height: 120rpx;"></view>
        </view>
      </scroll-view>
    </view>

    <view class="cart-bar" @click="openCartDetail">
      <view class="cart-left">
        <view class="cart-icon-box">
           <u-icon name="shopping-cart-fill" color="#2979ff" size="32"></u-icon>
           <view v-if="totalCount > 0" class="total-badge">{{ totalCount }}</view>
        </view>
        <text class="total-price">¥ {{ (totalPrice / 100).toFixed(2) }}</text>
      </view>
      <view class="cart-right" :class="{ disabled: totalCount === 0 }" @click.stop="handlePay">
        {{ totalCount > 0 ? '去结算' : '请选购' }}
      </view>
    </view>

    <u-popup :show="showCartPopup" mode="bottom" :round="16" @close="showCartPopup = false">
      <view class="cart-popup-content">
        <view class="cart-header">
          <text>已选商品</text>
          <view class="clear-btn" @click="clearCart">
            <u-icon name="trash" size="14" color="#999"></u-icon>
            <text>清空</text>
          </view>
        </view>
        <scroll-view scroll-y style="max-height: 500rpx;">
          <view class="cart-item" v-for="item in cart" :key="item.id">
            <text class="cart-name">{{ item.name }}</text>
            
            <view class="cart-action-right">
              <text class="cart-price">¥{{ (item.price * item.count / 100).toFixed(2) }}</text>
              
              <view class="cart-control-box">
                <view class="circle-btn minus" @click.stop="decreaseCart(item)">
                  <u-icon name="minus" color="#666" size="10" bold></u-icon>
                </view>
                <text class="cart-num">{{ item.count }}</text>
                <view class="circle-btn plus" @click.stop="addToCart(item)">
                  <u-icon name="plus" color="#fff" size="10" bold></u-icon>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>

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
import { ref, computed, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 环境变量配置
const BASE_URL = import.meta.env.VITE_SERVER_BASEURL || 'http://127.0.0.1:3000'

// 响应式状态定义
const categories = ref<any[]>([])
const tableList = ref<any[]>([]) 
const currentCategoryIndex = ref(0)
const toViewId = ref('')
const cart = ref<any[]>([])
const tableNumber = ref('') 
const tempTableNumber = ref('') 
const showTablePopup = ref(false)
const showCartPopup = ref(false)

// 页面加载生命周期：处理扫码参数与本地缓存恢复
onLoad((options: any) => {
  if (options && options.table) {
    tableNumber.value = options.table
    tempTableNumber.value = options.table
    showTablePopup.value = false
  } else {
    showTablePopup.value = true
  }
  
  const savedCart = uni.getStorageSync('my_cart_v1')
  if (savedCart) {
    cart.value = savedCart
  }
})

// 购物车数据持久化监听
watch(cart, (newCart) => {
  uni.setStorageSync('my_cart_v1', newCart)
}, { deep: true })

// 确认桌号操作
const confirmTable = () => {
  if (!tempTableNumber.value) return
  tableNumber.value = tempTableNumber.value
  showTablePopup.value = false
  uni.showToast({ title: `已选 ${tableNumber.value}`, icon: 'none' })
}

// 初始化数据请求
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
      products: prods.filter((p: any) => {
        if (Number(p.status) !== 1) return false
        return p.categoryId === c.id
      })
    }))
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  }
}

// 切换分类菜单
const switchMenu = (index: number) => {
  if (currentCategoryIndex.value === index) return
  currentCategoryIndex.value = index
  toViewId.value = 'category-' + index
}
const onRightScroll = (e: any) => {}

// 获取单品在购物车的数量
const getCartCount = (id: number) => {
  const item = cart.value.find(i => i.id === id)
  return item ? item.count : 0
}

// 获取分类下的商品总数
const getCategoryCount = (categoryId: number) => {
  return cart.value
    .filter(item => item.categoryId === categoryId)
    .reduce((sum, item) => sum + item.count, 0)
}

// 增加商品数量
const addToCart = (goods: any) => {
  if (goods.stock <= getCartCount(goods.id)) {
    return uni.showToast({ title: '库存不足', icon: 'none' })
  }
  
  const existingItem = cart.value.find(item => item.id === goods.id)
  if (existingItem) {
    existingItem.count++
  } else {
    cart.value.push({ ...goods, count: 1 })
  }
}

// 减少商品数量
const decreaseCart = (goods: any) => {
  const existingItem = cart.value.find(item => item.id === goods.id)
  if (existingItem) {
    existingItem.count--
    if (existingItem.count <= 0) {
      const index = cart.value.indexOf(existingItem)
      cart.value.splice(index, 1)
      if (cart.value.length === 0) showCartPopup.value = false
    }
  }
}

// 清空购物车
const clearCart = () => {
  uni.showModal({
    content: '确定清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        cart.value = []
        showCartPopup.value = false
      }
    }
  })
}

// 展开或关闭购物车详情
const openCartDetail = () => {
  if (cart.value.length > 0) {
    showCartPopup.value = !showCartPopup.value
  }
}

// 计算订单总价
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.count, 0))
// 计算订单总数量
const totalCount = computed(() => cart.value.reduce((sum, item) => sum + item.count, 0))

// 提交订单处理
const handlePay = () => {
  if (cart.value.length === 0) return
  if (!tableNumber.value) {
    showTablePopup.value = true 
    return
  }

  uni.showModal({
    title: '确认下单',
    content: `桌号：${tableNumber.value}\n共需支付 ${(totalPrice.value / 100).toFixed(2)} 元`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '提交中...' })
        try {
          const flatItems: any[] = []
          cart.value.forEach(item => {
            for (let i = 0; i < item.count; i++) {
              flatItems.push({ id: item.id, name: item.name, price: item.price })
            }
          })

          await uni.request({
            url: `${BASE_URL}/orders`,
            method: 'POST',
            header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
            data: {
              totalPrice: totalPrice.value,
              items: flatItems,
              tableNumber: tableNumber.value 
            }
          })
          cart.value = [] 
          showCartPopup.value = false
          uni.showToast({ title: '下单成功', icon: 'success' })
          fetchData() 
        } catch (e) {
          uni.showToast({ title: '下单失败', icon: 'error' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss">
@import 'uview-plus/theme.scss';

.u-wrap { height: 100vh; display: flex; flex-direction: column; }

/* 自定义导航栏内的桌号标签样式 */
.table-tag {
  display: flex; align-items: center; 
  background: #f0f7ff; 
  padding: 6rpx 16rpx; 
  border-radius: 30rpx;
  margin-left: 20rpx; 
  margin-top: 100rpx; 
  .table-text { font-size: 24rpx; color: #2979ff; margin: 0 8rpx; font-weight: bold; }
}

/* 菜单区域布局 */
.u-menu-wrap { flex: 1; display: flex;  }
.u-tab-view { width: 200rpx; height: 100%; background-color: #f6f6f6; }
.u-tab-item { 
  height: 110rpx; background: #f6f6f6; display: flex; align-items: center; justify-content: center; 
  font-size: 26rpx; color: #444; border-bottom: 1px solid #eee; position: relative; 
}
.u-tab-item-active { background: #fff; color: #000; font-weight: 600; border-left: 6rpx solid #2979ff; }
.category-badge {
  position: absolute; top: 10rpx; right: 10rpx; background-color: #fa3534; color: #fff; 
  font-size: 20rpx; width: 30rpx; height: 30rpx; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
}

.right-box { background-color: #fff; flex: 1; }
.class-item { background-color: #fff; padding: 16rpx; border-radius: 8rpx; }
.item-title { font-size: 26rpx; color: #303133; font-weight: bold; padding: 20rpx 0; }
.thumb-box { width: 100%; display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1px solid #f8f8f8; }
.item-menu-image { width: 120rpx; height: 120rpx; border-radius: 12rpx; margin-right: 20rpx; }
.item-menu-name { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }

.goods-title { font-weight: bold; font-size: 30rpx; color: #333; }
.desc-text { color: #999; font-size: 24rpx; margin-top: 5rpx; }
.stock-text { font-size: 22rpx; color: #ccc; margin-top: 4rpx; }

.action-row { 
  display: flex; justify-content: space-between; align-items: center; margin-top: 15rpx; 
  .price { color: #fa3534; font-weight: bold; font-size: 30rpx; }
}

/* 商品列表加减按钮 */
.cart-control {
  display: flex; align-items: center;
  .circle-btn {
    width: 48rpx; height: 48rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    &.plus { background-color: #2979ff; box-shadow: 0 4rpx 10rpx rgba(41, 121, 255, 0.3); }
    &.minus { border: 2rpx solid #ddd; background-color: #fff; margin-right: 10rpx; }
  }
  .goods-num { width: 50rpx; text-align: center; font-size: 28rpx; font-weight: bold; color: #333; }
}
.sold-out-text { font-size: 24rpx; color: #999; background: #f5f5f5; padding: 4rpx 10rpx; border-radius: 8rpx; }

/* 底部购物车栏 */
.cart-bar { 
  position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; 
  border-top: 1px solid #eee; display: flex; align-items: center; padding: 0 30rpx; z-index: 99; 
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); 
}
.cart-left { flex: 1; display: flex; align-items: center; }
.cart-icon-box { position: relative; margin-right: 20rpx; }
.total-badge { 
  position: absolute; top: -10rpx; right: -10rpx; background: #fa3534; color: #fff; 
  font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 20rpx; 
}
.total-price { font-weight: bold; font-size: 36rpx; color: #333; }
.cart-right { 
  width: 200rpx; height: 70rpx; background: #2979ff; color: #fff; 
  text-align: center; line-height: 70rpx; border-radius: 35rpx; font-size: 28rpx; 
  &.disabled { background: #ccc; }
}

/* 购物车详情弹窗 */
.cart-popup-content { padding: 30rpx; }
.cart-header { 
  display: flex; justify-content: space-between; padding-bottom: 20rpx; border-bottom: 1px solid #eee; 
  font-weight: bold; color: #333; font-size: 30rpx;
  .clear-btn { display: flex; align-items: center; color: #999; font-size: 24rpx; font-weight: normal; }
}
.cart-item {
  display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1px solid #f8f8f8;
  .cart-name { flex: 1; font-size: 28rpx; color: #333; font-weight: 500; }
  
  .cart-action-right { display: flex; align-items: center; }
  .cart-price { margin-right: 30rpx; font-weight: bold; color: #fa3534; font-size: 30rpx; }
  
  /* 弹窗内的加减按钮 */
  .cart-control-box {
    display: flex; align-items: center;
    .circle-btn {
      width: 44rpx; height: 44rpx; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      &.plus { background-color: #2979ff; }
      &.minus { background-color: #f5f5f5; border: 1px solid #eee; }
    }
    .cart-num { margin: 0 20rpx; font-size: 30rpx; font-weight: bold; color: #333; min-width: 40rpx; text-align: center; }
  }
}

/* 桌号弹窗 */
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
      &.active { background: #e6f1ff; color: #2979ff; border-color: #2979ff; }
    }
  }
  .btn-box { width: 100%; }
}
</style>