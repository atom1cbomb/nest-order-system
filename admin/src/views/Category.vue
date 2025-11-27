// [分类页面] 菜品分类列表展示与维护界面
<template>
  <div class="page-container">
    <el-card shadow="hover" class="main-card">
      <div class="header-actions">
        <div class="title">分类列表</div>
        <el-button type="primary" size="default" icon="Plus" @click="handleCreate">新增分类</el-button>
      </div>

      <el-table 
        :data="tableData" 
        style="width: 100%; margin-top: 20px;" 
        v-loading="loading"
        border
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序权重" width="100" align="center" />
        
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增分类" width="400px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="例如：盖浇饭" />
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
import { formatTime } from '../utils/format' // 引入工具函数
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', sort: 1 })

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/categories')
    tableData.value = res as any
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  form.value = { name: '', sort: 1 }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  await request.post('/categories', form.value)
  ElMessage.success('添加成功')
  dialogVisible.value = false
  fetchList()
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' })
    .then(async () => {
      await request.delete(`/categories/${id}`)
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