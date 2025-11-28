/**
 * @file Dashboard.vue
 * @description 数据看板页面，展示核心运营指标及可视化图表（ECharts）
 */
<template>
  <div class="dashboard-container">
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span>今日订单</span>
            <el-tag type="success">日</el-tag>
          </div>
          <div class="card-value">{{ stats.todayOrders }}</div>
          <div class="card-footer">
            昨日 {{ stats.yesterdayOrders }} 单
            <span v-if="stats.todayOrders >= stats.yesterdayOrders" class="trend-up">↑</span>
            <span v-else class="trend-down">↓</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span>今日营业额</span>
            <el-tag type="warning">日</el-tag>
          </div>
          <div class="card-value">¥ {{ formatPrice(stats.todayRevenue) }}</div>
          <div class="card-footer">
            昨日 ¥ {{ formatPrice(stats.yesterdayRevenue) }}
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span>菜品总数</span>
            <el-tag>库</el-tag>
          </div>
          <div class="card-value">{{ stats.totalProducts }}</div>
          <div class="card-footer">实时在售商品</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span>累计用户</span>
            <el-tag type="danger">总</el-tag>
          </div>
          <div class="card-value">{{ stats.totalUsers }}</div>
          <div class="card-footer">系统注册用户</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span>近七日营收趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span>热销分类占比</span>
            </div>
          </template>
          <div ref="pieChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">


import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '../utils/request'

// 图表 DOM 引用
const lineChartRef = ref()
const pieChartRef = ref()

// 图表实例对象
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// 页面加载状态
const loading = ref(true)

// 统计数据响应式对象
const stats = reactive({
  todayOrders: 0,
  yesterdayOrders: 0,
  todayRevenue: 0,
  yesterdayRevenue: 0,
  totalProducts: 0,
  totalUsers: 0
})

// 价格格式化工具
const formatPrice = (val: number) => val.toFixed(2)

// 获取统计数据，并初始化图表
const fetchData = async () => {
  try {
    loading.value = true
    const res: any = await request.get('/orders/stats')
    
    // 更新基础卡片数据
    stats.todayOrders = res.todayOrders
    stats.yesterdayOrders = res.yesterdayOrders
    stats.todayRevenue = res.todayRevenue
    stats.yesterdayRevenue = res.yesterdayRevenue
    stats.totalProducts = res.totalProducts
    stats.totalUsers = res.totalUsers

    // 渲染图表
    initLineChart(res.trend)
    initPieChart(res.categoryPie)
  } catch (error) {
    console.error('获取看板数据失败', error)
  } finally {
    loading.value = false
  }
}

// 初始化折线图 (营收趋势)
const initLineChart = (data: any[]) => {
  if (!lineChartRef.value) return
  // 如果实例已存在则销毁，防止内存泄漏或渲染异常
  if (lineChart) lineChart.dispose()
  
  lineChart = echarts.init(lineChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.date) // X轴：日期
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: true, // 平滑曲线
        data: data.map(item => item.value), // Y轴：金额
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          // 渐变色填充，提升视觉效果
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.5)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' }
          ])
        }
      }
    ]
  }
  lineChart.setOption(option)
}

// 初始化饼图 (分类占比)
const initPieChart = (data: any[]) => {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()

  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: ['40%', '70%'], // 环形图效果
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        data: data // 直接使用后端数据
      }
    ]
  }
  pieChart.setOption(option)
}

// 监听窗口大小改变，自适应调整图表
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 数据卡片样式 */
.data-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 14px;
}
.data-card .card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 15px 0;
}
.data-card .card-footer {
  font-size: 12px;
  color: #606266;
}

.trend-up { color: #f56c6c; font-weight: bold; margin-left: 4px; }
.trend-down { color: #67c23a; font-weight: bold; margin-left: 4px; }

.chart-header {
  font-weight: bold;
  color: #303133;
}
</style>