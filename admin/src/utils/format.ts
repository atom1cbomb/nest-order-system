// [工具函数] 时间格式化与金额转换通用工具
// 格式化时间：YYYY-MM-DD HH:mm:ss
export const formatTime = (timeStr: string) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// 格式化金额：分 -> 元
export const formatPrice = (price: number) => {
  if (price === undefined || price === null) return '0.00'
  return (price / 100).toFixed(2)
}