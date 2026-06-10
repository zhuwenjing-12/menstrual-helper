/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|String} date
 * @returns {String}
 */
export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期为中文显示
 * @param {Date|String} date
 * @returns {String}
 */
export function formatDateCN(date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化日期为完整中文
 * @param {Date|String} date
 * @returns {String}
 */
export function formatDateFullCN(date) {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 获取两个日期之间的天数差
 * @param {Date|String} date1
 * @param {Date|String} date2
 * @returns {Number}
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

/**
 * 添加天数
 * @param {Date|String} date
 * @param {Number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * 判断两个日期是否是同一天
 * @param {Date|String} date1
 * @param {Date|String} date2
 * @returns {Boolean}
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * 判断日期是否在范围内
 * @param {Date|String} date
 * @param {Date|String} start
 * @param {Date|String} end
 * @returns {Boolean}
 */
export function isDateInRange(date, start, end) {
  const d = new Date(date)
  const s = new Date(start)
  const e = new Date(end)
  d.setHours(0, 0, 0, 0)
  s.setHours(0, 0, 0, 0)
  e.setHours(0, 0, 0, 0)
  return d >= s && d <= e
}

/**
 * 获取某月的天数
 * @param {Number} year
 * @param {Number} month - 0-11
 * @returns {Number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 获取某月第一天是星期几
 * @param {Number} year
 * @param {Number} month - 0-11
 * @returns {Number} 0-6
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

/**
 * 获取今天的日期字符串
 * @returns {String} YYYY-MM-DD
 */
export function getToday() {
  return formatDate(new Date())
}

/**
 * 判断是否是今天
 * @param {Date|String} date
 * @returns {Boolean}
 */
export function isToday(date) {
  return isSameDay(date, new Date())
}

/**
 * 判断是否是过去日期
 * @param {Date|String} date
 * @returns {Boolean}
 */
export function isPast(date) {
  const d = new Date(date)
  const today = new Date()
  d.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * 获取星期几的中文
 * @param {Number} day - 0-6
 * @returns {String}
 */
export function getWeekDayCN(day) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[day]
}

/**
 * 计算相对日期描述
 * @param {Date|String} date
 * @returns {String}
 */
export function getRelativeDateDesc(date) {
  const days = daysBetween(getToday(), date)
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days === -1) return '昨天'
  if (days > 0 && days <= 7) return `${days}天后`
  if (days < 0 && days >= -7) return `${Math.abs(days)}天前`
  return formatDateCN(date)
}
