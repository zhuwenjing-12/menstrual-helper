/**
 * 全局状态管理 - 使用Vue2兼容方式
 * 管理经期记录、用户设置等全局状态
 */

// 从本地存储加载数据
function loadFromStorage(key, defaultValue) {
  try {
    const data = uni.getStorageSync(key)
    return data || defaultValue
  } catch (e) {
    return defaultValue
  }
}

// 保存到本地存储
function saveToStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.error('存储失败:', key, e)
  }
}

// 全局状态
const store = {
  // 经期记录列表
  records: loadFromStorage('menstrual_records', []),

  // 用户设置
  settings: loadFromStorage('menstrual_settings', {
    cycleLength: 28, // 平均周期天数
    periodLength: 5, // 平均经期天数
    remindBefore: 2, // 提前提醒天数
    enableRemind: true // 是否开启提醒
  }),

  // 用户基本信息
  userInfo: loadFromStorage('user_info', {
    nickname: '',
    birthday: '',
    cycleHistory: [] // 历史周期长度记录
  }),

  /**
   * 添加经期记录
   * @param {Object} record - 记录对象
   */
  addRecord(record) {
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      createTime: new Date().toISOString()
    }
    this.records.push(newRecord)
    this.records.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    saveToStorage('menstrual_records', this.records)
    this.updateCycleStats()
    return newRecord
  },

  /**
   * 更新经期记录
   * @param {String} id - 记录ID
   * @param {Object} data - 更新数据
   */
  updateRecord(id, data) {
    const index = this.records.findIndex(r => r.id === id)
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...data }
      this.records.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      saveToStorage('menstrual_records', this.records)
      this.updateCycleStats()
    }
  },

  /**
   * 删除经期记录
   * @param {String} id - 记录ID
   */
  deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id)
    saveToStorage('menstrual_records', this.records)
    this.updateCycleStats()
  },

  /**
   * 获取最近的记录
   * @param {Number} count - 数量
   */
  getRecentRecords(count = 6) {
    return this.records
      .slice()
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, count)
  },

  /**
   * 更新周期统计数据
   */
  updateCycleStats() {
    if (this.records.length < 2) return

    const sorted = this.records
      .slice()
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

    const cycleLengths = []
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].startDate)
      const curr = new Date(sorted[i].startDate)
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
      if (diff > 15 && diff < 60) {
        cycleLengths.push(diff)
      }
    }

    if (cycleLengths.length > 0) {
      const avgCycle = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      )
      this.settings.cycleLength = avgCycle
      this.userInfo.cycleHistory = cycleLengths
      saveToStorage('menstrual_settings', this.settings)
      saveToStorage('user_info', this.userInfo)
    }
  },

  /**
   * 更新设置
   * @param {Object} newSettings - 新设置
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    saveToStorage('menstrual_settings', this.settings)
  },

  /**
   * 更新用户信息
   * @param {Object} info - 用户信息
   */
  updateUserInfo(info) {
    this.userInfo = { ...this.userInfo, ...info }
    saveToStorage('user_info', this.userInfo)
  },

  /**
   * 导出所有数据
   */
  exportData() {
    return JSON.stringify({
      records: this.records,
      settings: this.settings,
      userInfo: this.userInfo,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2)
  },

  /**
   * 导入数据
   * @param {String} jsonString - JSON数据字符串
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      if (data.records) {
        this.records = data.records
        saveToStorage('menstrual_records', this.records)
      }
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings }
        saveToStorage('menstrual_settings', this.settings)
      }
      if (data.userInfo) {
        this.userInfo = { ...this.userInfo, ...data.userInfo }
        saveToStorage('user_info', this.userInfo)
      }
      return true
    } catch (e) {
      console.error('导入数据失败:', e)
      return false
    }
  },

  /**
   * 清除所有数据
   */
  clearAll() {
    this.records = []
    this.settings = {
      cycleLength: 28,
      periodLength: 5,
      remindBefore: 2,
      enableRemind: true
    }
    this.userInfo = {
      nickname: '',
      birthday: '',
      cycleHistory: []
    }
    uni.clearStorageSync()
  }
}

export default store
