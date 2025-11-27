// [路由配置] 页面路由定义与导航守卫配置
import { createRouter, createWebHistory } from 'vue-router'
import Category from '../views/Category.vue'
import Product from '../views/Product.vue'
import Order from '../views/Order.vue'
import Table from '../views/Table.vue' 

const routes = [
  { 
    path: '/', 
    name: 'Category', 
    component: Category,
    meta: { title: '分类管理', icon: 'Menu' }
  },
  { 
    path: '/product', 
    name: 'Product', 
    component: Product,
    meta: { title: '菜品管理', icon: 'Food' }
  },
  { 
    path: '/order', 
    name: 'Order', 
    component: Order,
    meta: { title: '订单管理', icon: 'List' }
  },
  // 👇 2. 注册 /table 路由
  { 
    path: '/table', 
    name: 'Table', 
    component: Table,
    meta: { title: '桌号管理', icon: 'Ticket' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router