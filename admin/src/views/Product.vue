// [菜品页面] 菜品图文信息录入与上下架管理界面
<template>
  <div class="page-container">
    <el-card shadow="hover" class="main-card">
      <div class="header-actions">
        <div class="title">菜品列表</div>
        <el-button type="primary" icon="Plus" @click="handleCreate">新增菜品</el-button>
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
        
        <el-table-column label="图片" width="120" align="center">
          <template #default="scope">
            <el-image 
  style="width: 60px; height: 60px; border-radius: 4px; border: 1px solid #eee;"
  :src="scope.row.image || '/default.png'" 
  :preview-src-list="[scope.row.image || '/default.png']"
  fit="cover"
>
  <template #error>
    <div class="image-slot">
      <img src="/default.png" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  </template>
</el-image>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="菜品名称" min-width="150" />
        
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥ {{ formatPrice(scope.row.price) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="120" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.category">{{ scope.row.category.name }}</el-tag>
            <el-tag type="info" v-else>未分类</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="100" align="center" />
        
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row.id)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑菜品" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择" style="width: 100%">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格(元)" required>
          <el-input-number v-model="form.priceYuan" :precision="2" :step="1" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="form.description" /></el-form-item>
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
import { formatTime, formatPrice } from '../utils/format'
import { Plus, Delete, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const categoryList = ref<any[]>([])
const dialogVisible = ref(false)
const form = ref<any>({ name: '', categoryId: null, priceYuan: 0, stock: 999, image: '', description: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const [pRes, cRes] = await Promise.all([request.get('/products'), request.get('/categories')])
    tableData.value = pRes as any
    categoryList.value = cRes as any
  } finally { loading.value = false }
}

const handleCreate = () => {
  form.value = { name: '', categoryId: null, priceYuan: 0, stock: 999, image: '', description: '' }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.value.name || !form.value.categoryId) return ElMessage.warning('请填写完整')
  const submitData = { ...form.value, price: Math.round(form.value.priceYuan * 100) }
  delete submitData.priceYuan
  await request.post('/products', submitData)
  ElMessage.success('操作成功')
  dialogVisible.value = false
  fetchData()
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确认下架？', '提示', { type: 'warning' }).then(async () => {
    // await request.delete(`/products/${id}`)
    ElMessage.info('演示环境暂不删除')
  })
}

// 上传逻辑
const handleUploadSuccess: UploadProps['onSuccess'] = (res) => { form.value.image = res.url }
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  if (file.size / 1024 / 1024 > 2) { ElMessage.error('图片需小于2MB'); return false }
  return true
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; background-color: #f0f2f5; min-height: 100vh; }
.main-card { border-radius: 8px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.title { font-size: 18px; font-weight: bold; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }

.avatar-uploader .el-upload { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; position: relative; overflow: hidden; }
.avatar-uploader .el-upload:hover { border-color: #409EFF; }
.avatar-uploader-icon { font-size: 28px; color: #8c939d; width: 100px; height: 100px; text-align: center; line-height: 100px; }
.avatar { width: 100px; height: 100px; display: block; object-fit: cover; }
.image-slot { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #f5f7fa; color: #909399; font-size: 20px; }
</style>