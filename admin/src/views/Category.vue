/**
 * @file admin/src/views/Category.vue
 * @description 分类管理页面，处理菜品分类的创建、排序与维护
 */
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
            <el-button 
              type="danger" 
              link 
              icon="Delete" 
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增分类" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="form.sort" :min="0" :max="999" />
          <div class="tips">数字越小越靠前</div>
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
import { formatTime } from '../utils/format'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据与加载状态
const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', sort: 1 })

// 获取分类列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/categories')
    tableData.value = res as any
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗并重置表单数据
const handleCreate = () => {
  form.value = { name: '', sort: 1 }
  dialogVisible.value = true
}

// 提交分类表单并刷新列表
const submitForm = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  try {
    await request.post('/categories', form.value)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
    // 错误已由拦截器处理
  }
}

// 删除分类（带确认弹窗）
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除该分类吗？若该分类下包含菜品，可能导致删除失败。', '警告', { 
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning' 
  }).then(async () => {
    try {
      // 发起删除请求
      await request.delete(`/categories/${id}`)
      ElMessage.success('删除成功')
      // 删除成功后刷新列表
      await fetchList()
    } catch (error: any) {
      // 捕获异常，防止未捕获的 Promise 错误
      console.error('删除操作未完成:', error)
    }
  }).catch(() => {
    // 用户点击取消
  })
}

// 组件挂载后获取分类列表
onMounted(() => fetchList())
</script>

<style scoped>
.page-container { padding: 20px; background-color: #f0f2f5; min-height: 100vh; }
.main-card { border-radius: 8px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }
.tips { font-size: 12px; color: #909399; margin-left: 10px; line-height: 32px; }
</style>