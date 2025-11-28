// [路由配置] 页面路由定义与导航守卫配置
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Category from '../views/Category.vue'
import Product from '../views/Product.vue'
import Order from '../views/Order.vue'
import Table from '../views/Table.vue'

/**
 * 路由配置文件
 * 定义应用的路由规则、页面组件映射及导航守卫
 */

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', hidden: true }
  },
  { 
    path: '/', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { title: '数据看板', icon: 'Odometer' }
  },
  { 
    path: '/category', 
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
    path: '/table', 
    name: 'Table', 
    component: Table,
    meta: { title: '桌号管理', icon: 'Ticket' }
  },
  { 
    path: '/order', 
    name: 'Order', 
    component: Order,
    meta: { title: '订单管理', icon: 'List' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置守卫
 * 校验用户是否已登录，未登录则强制跳转至登录页
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  if (to.path === '/login') {
    // 如果已登录，重复访问登录页则跳转首页
    if (token) return next('/')
    return next()
  }

  if (!token) {
    return next('/login')
  }

  next()
})

export default router