// [网络请求] Axios拦截器封装与统一错误处理
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api', 
  timeout: 5000
})

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // --- 修改开始：增强错误提示 ---
    
    // 1. 尝试获取后端返回的详细业务错误信息
    // NestJS 默认异常返回格式通常在 response.data.message 中
    const apiMessage = error.response?.data?.message
    
    // 2. 处理消息格式：后端可能返回字符串，也可能返回数组（如DTO校验错误）
    let errorMessage = '请求失败'
    if (apiMessage) {
      errorMessage = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage
    } else if (error.message) {
      // 如果没有业务错误信息，则使用 HTTP 状态错误信息
      errorMessage = error.message
    }

    // 3. 显示具体的错误提示
    ElMessage.error(errorMessage)
    
    // --- 修改结束 ---

    return Promise.reject(error)
  }
)

export default service