/**
 * @file Order.vue
 * @description 订单管理页面，包含实时订单监控、状态流转（接单/完成）及自动接单设置
 */

<template>
  <div class="page-container">
    <el-card shadow="never" class="filter-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div class="title">订单管理</div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px; font-size: 14px; color: #606266;">自动接单</span>
          <el-switch 
            v-model="autoAccept" 
            inline-prompt 
            active-text="开" 
            inactive-text="关"
            @change="handleAutoAcceptChange"
          />
        </div>
      </div>

      <el-form :inline="true" :model="queryForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input v-model="queryForm.userId" placeholder="输入ID" clearable style="width: 120px;" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="queryForm.minPrice" placeholder="最低" style="width: 80px;" />
          <span style="margin: 0 5px; color:#999">-</span>
          <el-input v-model="queryForm.maxPrice" placeholder="最高" style="width: 80px;" />
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading" stripe :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
        
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 15px 30px; background: #fafafa;">
              <h4 style="margin: 0 0 10px 0; color: #606266;">📦 订单明细</h4>
              <el-table :data="props.row.items" size="small" border>
                <el-table-column prop="productName" label="菜品" />
                <el-table-column prop="count" label="数量" width="80" align="center" />
                <el-table-column label="单价" align="right">
                  <template #default="scope">¥ {{ formatPrice(scope.row.price) }}</template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="单号" width="80" align="center" />
        
        <el-table-column label="金额" width="120" align="right">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold; font-family: 'DIN';">¥ {{ formatPrice(scope.row.totalPrice) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="桌号" width="100" align="center">
          <template #default="scope">
            <el-tag effect="dark" type="danger" size="large" style="font-weight: bold; border: none;">
              {{ scope.row.tableNumber || '自提' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="160">
          <template #default="scope">
            <div v-if="scope.row.user" style="display: flex; flex-direction: column;">
              <span style="font-weight: bold; color: #333;">{{ scope.row.user.nickname || '未设置昵称' }}</span>
              <span style="font-size: 12px; color: #909399; font-family: monospace;">ID: {{ getVipNo(scope.row.user.openid) }}</span>
            </div>
            <el-tag type="info" v-else>游客</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="danger" effect="dark">待接单</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="warning" effect="dark">制作中</el-tag>
            <el-tag v-else type="success" effect="plain">已完成</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="下单时间" width="180" align="center">
          <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0" type="primary" size="small" @click="handleStatus(scope.row.id, 1)">接单</el-button>
            <el-button v-if="scope.row.status === 1" type="success" size="small" @click="handleStatus(scope.row.id, 2)">完成</el-button>
            <span v-if="scope.row.status === 2" style="color: #999; font-size: 12px;">已完成</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { formatTime, formatPrice } from '../utils/format'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { io } from "socket.io-client";

// 数据状态定义
const loading = ref(false)
const tableData = ref([])
const queryForm = ref({ userId: '', minPrice: '', maxPrice: '' })
const dateRange = ref([])
const autoAccept = ref(false) 

// 格式化用户ID显示
const getVipNo = (openid: string) => openid ? openid.substring(openid.length - 8).toUpperCase() : '------'

// 获取自动接单配置
const fetchConfig = async () => {
  try {
    const res: any = await request.get('/configs/auto_accept')
    autoAccept.value = res.value === 'true'
  } catch (e) {}
}

// 切换自动接单开关
const handleAutoAcceptChange = async (val: boolean) => {
  try {
    await request.post('/configs', {
      key: 'auto_accept',
      value: String(val)
    })
    ElMessage.success(val ? '已开启自动接单' : '已关闭自动接单')
  } catch (e) {
    autoAccept.value = !val
    ElMessage.error('设置失败')
  }
}

// 获取订单列表
const fetchList = async () => {
  loading.value = true
  try {
    const params: any = { ...queryForm.value }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0] + ' 00:00:00'
      params.endDate = dateRange.value[1] + ' 23:59:59'
    }
    const res = await request.get('/orders', { params })
    tableData.value = res as any
  } finally { loading.value = false }
}

// 搜索与重置
const handleSearch = () => fetchList()
const resetSearch = () => { queryForm.value = { userId: '', minPrice: '', maxPrice: '' }; dateRange.value = []; fetchList() }

// 更改订单状态（接单/完成）
const handleStatus = async (id: number, status: number) => {
  try {
    await request.patch(`/orders/${id}`, { status })
    ElMessage.success('状态已更新')
    fetchList() 
  } catch (e) { ElMessage.error('操作失败') }
}

onMounted(() => {
  fetchList()
  fetchConfig()
  
  // 建立 WebSocket 监听新订单
  const socket = io('http://localhost:3000', { transports: ['websocket'] });
  socket.on('newOrder', () => { 
    if (!queryForm.value.userId && !queryForm.value.minPrice) fetchList() 
  });
})
</script>

<style scoped>
.page-container { padding: 20px; background-color: #f0f2f5; min-height: 100vh; }
.filter-card { margin-bottom: 20px; border-radius: 8px; border: none; }
.table-card { border-radius: 8px; border: none; }
.title { font-size: 18px; font-weight: bold; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }
</style>