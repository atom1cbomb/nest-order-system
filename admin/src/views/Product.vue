/**
 * @file Product.vue
 * @description 菜品管理页面，负责菜品的增删改查、图片上传及库存管理
 */
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

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success" effect="dark" size="small">销售中</el-tag>
            <el-tag v-else type="info" effect="plain" size="small">已下架</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="100" align="center" />
        
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              icon="Edit" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>

            <el-button 
              v-if="scope.row.status === 1"
              type="danger" 
              link 
              icon="Delete" 
              @click="handleOffShelf(scope.row.id)"
            >
              下架
            </el-button>

            <el-button 
              v-else
              type="primary" 
              link 
              icon="Upload" 
              @click="handleOnShelf(scope.row.id)"
            >
              上架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑菜品' : '新增菜品'" width="500px">
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
import { Plus, Delete, Upload, Edit } from '@element-plus/icons-vue' // 引入 Edit 图标
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'

// 页面加载状态与数据源
const loading = ref(false)
const tableData = ref([])
const categoryList = ref<any[]>([])
const dialogVisible = ref(false)
const form = ref<any>({ name: '', categoryId: null, priceYuan: 0, stock: 999, image: '', description: '', status: 1 })

// 初始化获取商品列表与分类列表
const fetchData = async () => {
  loading.value = true
  try {
    const [pRes, cRes] = await Promise.all([request.get('/products'), request.get('/categories')])
    tableData.value = pRes as any
    categoryList.value = cRes as any
  } finally { loading.value = false }
}

/**
 * @description 打开新增弹窗重置表单
 */
const handleCreate = () => {
  // 显式清空 id 以确保是新增模式
  form.value = { id: undefined, name: '', categoryId: null, priceYuan: 0, stock: 999, image: '', description: '', status: 1 }
  dialogVisible.value = true
}

/**
 * @description 打开编辑弹窗并回显数据
 * @param {object} row 当前行数据
 */
const handleEdit = (row: any) => {
  // 深拷贝避免直接修改表格数据，并处理价格单位（分转元）
  form.value = { 
    ...row, 
    priceYuan: row.price / 100,
    // 确保 categoryId 存在，防止后端未返回 id 字段只返回 category 对象的情况
    categoryId: row.categoryId || (row.category ? row.category.id : null)
  }
  dialogVisible.value = true
}

/**
 * @description 提交菜品表单（区分新增与编辑）
 */
const submitForm = async () => {
  if (!form.value.name || !form.value.categoryId) return ElMessage.warning('请填写完整')
  
  // 构造提交数据，价格元转分
  const submitData = { ...form.value, price: Math.round(form.value.priceYuan * 100) }
  delete submitData.priceYuan
  // 移除可能存在的关联对象，避免提交多余数据
  delete submitData.category 
  delete submitData.createTime
  delete submitData.updateTime

  try {
    if (form.value.id) {
      // 编辑模式：调用 Patch 接口
      await request.patch(`/products/${form.value.id}`, submitData)
    } else {
      // 新增模式：调用 Post 接口
      await request.post('/products', submitData)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
    // 错误处理通常由 request 拦截器统一处理，这里可省略或保留
  }
}

// 下架菜品逻辑 (status -> 0)
const handleOffShelf = (id: number) => {
  ElMessageBox.confirm('确认下架该菜品？下架后用户端将不可见。', '提示', { type: 'warning' }).then(async () => {
    try {
      await request.patch(`/products/${id}`, { status: 0 })
      ElMessage.success('已下架')
      fetchData()
    } catch (e: any) {
      console.error(e)
      ElMessage.error('操作失败')
    }
  })
}

// 上架菜品逻辑 (status -> 1)
const handleOnShelf = (id: number) => {
  // 直接上架通常不需要强提醒，或者给个轻提示即可
  ElMessageBox.confirm('确认重新上架该菜品？', '提示', { type: 'info' }).then(async () => {
    try {
      await request.patch(`/products/${id}`, { status: 1 })
      ElMessage.success('已上架')
      fetchData()
    } catch (e: any) {
      console.error(e)
      ElMessage.error('操作失败')
    }
  })
}

// 图片上传成功回调
const handleUploadSuccess: UploadProps['onSuccess'] = (res) => { form.value.image = res.url }

// 上传前校验文件大小
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