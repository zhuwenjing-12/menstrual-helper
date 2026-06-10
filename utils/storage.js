/**
 * 本地存储工具
 * 封装uni.storage API，提供类型安全的存取方法
 */

const STORAGE_KEYS = {
  RECORDS: 'menstrual_records',
  SETTINGS: 'menstrual_settings',
  USER_INFO: 'user_info',
  LOCK_PASSWORD: 'lock_password',
  THEME: 'app_theme',
  FIRST_OPEN: 'first_open'
}

/**
 * 获取存储数据
 * @param {String} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const data = uni.getStorageSync(key)
    return data !== '' && data !== undefined ? data : defaultValue
  } catch (e) {
    console.error('读取存储失败:', key)
    return defaultValue
  }
}

/**
 * 设置存储数据
 * @param {String} key
 * @param {*} value
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.error('写入存储失败:', key)
  }
}

/**
 * 删除存储数据
 * @param {String} key
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    console.error('删除存储失败:', key)
  }
}

/**
 * 清除所有存储
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('清除存储失败')
  }
}

/**
 * 获取存储信息
 * @returns {Object}
 */
export function getStorageInfo() {
  try {
    return uni.getStorageInfoSync()
  } catch (e) {
    return { currentSize: 0, keys: [], limitSize: 0 }
  }
}

export { STORAGE_KEYS }
