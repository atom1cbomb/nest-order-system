/**
 * @file admin/src/views/Table.vue
 * @description 桌号管理页面，用于餐厅桌号的生成、排序与删除
 */
<template>
  <div class="page-container">
    <el-card shadow="hover" class="main-card">
      <div class="header-actions">
        <div class="title">桌号管理</div>
        <el-button type="primary" icon="Plus" @click="handleCreate">添加桌号</el-button>
      </div>

      <el-table :data="tableData" border style="width: 100%; margin-top: 20px;" v-loading="loading" stripe>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        
        <el-table-column prop="name" label="桌号" align="center">
          <template #default="scope">
            <el-tag effect="dark" size="large">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加桌号" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="如: A01, VIP1" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">


import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态定义
const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', sort: 1 })

// 获取桌号列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/tables')
    tableData.value = res as any
  } finally { loading.value = false }
}

// 初始化新增表单
const handleCreate = () => {
  form.value = { name: '', sort: 1 }
  dialogVisible.value = true
}

// 提交新增请求
const submitForm = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  try {
    await request.post('/tables', form.value)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchList()
  } catch(e) { ElMessage.error('添加失败，可能是桌号重复') }
}

// 删除桌号
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(async () => {
    await request.delete(`/tables/${id}`)
    ElMessage.success('删除成功')
    fetchList()
  })
}

onMounted(() => fetchList())
</script>

<style scoped>
.page-container { padding: 20px; background-color: #f0f2f5; min-height: 100vh; }
.main-card { border-radius: 8px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.title { font-size: 18px; font-weight: bold; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }
</style>