<template>
  <view class="page-container">
    <!-- 导出数据 -->
    <view class="section card">
      <text class="section-title">📤 导出数据</text>
      <text class="section-desc">将所有经期记录导出为JSON文件，可用于备份或迁移到其他设备。</text>
      <button class="btn-primary export-btn" @tap="exportData">导出数据</button>
    </view>

    <!-- 导入数据 -->
    <view class="section card">
      <text class="section-title">📥 导入数据</text>
      <text class="section-desc">从之前导出的JSON文件中恢复数据。导入会覆盖当前数据。</text>
      <button class="btn-secondary import-btn" @tap="importData">选择文件导入</button>
    </view>

    <!-- 通过剪贴板 -->
    <view class="section card">
      <text class="section-title">📋 剪贴板操作</text>
      <text class="section-desc">通过剪贴板复制/粘贴数据，方便在设备间传输。</text>
      <view class="clipboard-btns">
        <button class="btn-secondary" @tap="copyToClipboard">复制到剪贴板</button>
        <button class="btn-secondary" @tap="pasteFromClipboard">从剪贴板导入</button>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="section card">
      <text class="section-title">📊 当前数据</text>
      <view class="data-info">
        <view class="info-row">
          <text class="info-label">经期记录数</text>
          <text class="info-value">{{ recordCount }} 条</text>
        </view>
        <view class="info-row">
          <text class="info-label">存储大小</text>
          <text class="info-value">{{ storageSize }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">最早记录</text>
          <text class="info-value">{{ firstRecord || '暂无' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">最近记录</text>
          <text class="info-value">{{ lastRecord || '暂无' }}</text>
        </view>
      </view>
    </view>

    <!-- 清除数据 -->
    <view class="section card danger-section">
      <text class="section-title">⚠️ 危险操作</text>
      <text class="section-desc">清除所有数据后无法恢复，请确保已备份。</text>
      <button class="delete-btn" @tap="clearAllData">清除所有数据</button>
    </view>
  </view>
</template>

<script>
import store from '../../store'

export default {
  data() {
    return {
      recordCount: 0,
      storageSize: '0KB',
      firstRecord: '',
      lastRecord: ''
    }
  },
  onLoad() {
    this.loadDataInfo()
  },
  methods: {
    loadDataInfo() {
      const records = store.records || []
      this.recordCount = records.length

      try {
        const info = uni.getStorageInfoSync()
        this.storageSize = (info.currentSize || 0) + 'KB'
      } catch (e) {
        this.storageSize = '未知'
      }

      if (records.length > 0) {
        const sorted = records.slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        this.firstRecord = sorted[0].startDate
        this.lastRecord = sorted[sorted.length - 1].startDate
      }
    },
    exportData() {
      const data = store.exportData()
      // #ifdef APP-PLUS
      // 在APP端保存文件
      const filePath = '_doc/menstrual_backup_' + new Date().getTime() + '.json'
      plus.io.resolveLocalFileSystemURL('_doc', (entry) => {
        entry.getFile(filePath, { create: true }, (fileEntry) => {
          fileEntry.createWriter((writer) => {
            writer.onwrite = () => {
              uni.showModal({
                title: '导出成功',
                content: '文件已保存到：' + filePath,
                showCancel: false
              })
            }
            writer.write(data)
          })
        })
      })
      // #endif

      // #ifdef H5
      // H5端下载文件
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'menstrual_backup_' + new Date().getTime() + '.json'
      a.click()
      URL.revokeObjectURL(url)
      uni.showToast({ title: '导出成功', icon: 'success' })
      // #endif

      // #ifdef MP-WEIXIN
      // 小程序端复制到剪贴板
      uni.setClipboardData({
        data: data,
        success: () => {
          uni.showModal({
            title: '导出成功',
            content: '数据已复制到剪贴板，请粘贴保存到文件中。',
            showCancel: false
          })
        }
      })
      // #endif
    },
    importData() {
      // #ifdef APP-PLUS
      plus.gallery.pick((path) => {
        plus.io.resolveLocalFileSystemURL(path, (entry) => {
          entry.file((file) => {
            const reader = new plus.io.FileReader()
            reader.onloadend = (e) => {
              this.doImport(e.target.result)
            }
            reader.readAsText(file)
          })
        })
      }, (err) => {
        uni.showToast({ title: '选择文件失败', icon: 'none' })
      })
      // #endif

      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            this.doImport(event.target.result)
          }
          reader.readAsText(file)
        }
      }
      input.click()
      // #endif

      // #ifdef MP-WEIXIN
      uni.showToast({ title: '请使用剪贴板导入', icon: 'none' })
      // #endif
    },
    doImport(jsonString) {
      uni.showModal({
        title: '确认导入',
        content: '导入将覆盖当前所有数据，确定继续吗？',
        confirmColor: '#FF6B9D',
        success: (res) => {
          if (res.confirm) {
            const success = store.importData(jsonString)
            if (success) {
              uni.showToast({ title: '导入成功', icon: 'success' })
              this.loadDataInfo()
            } else {
              uni.showToast({ title: '导入失败，数据格式错误', icon: 'none' })
            }
          }
        }
      })
    },
    copyToClipboard() {
      const data = store.exportData()
      uni.setClipboardData({
        data: data,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        }
      })
    },
    pasteFromClipboard() {
      uni.getClipboardData({
        success: (res) => {
          if (res.data) {
            this.doImport(res.data)
          } else {
            uni.showToast({ title: '剪贴板为空', icon: 'none' })
          }
        }
      })
    },
    clearAllData() {
      uni.showModal({
        title: '⚠️ 警告',
        content: '确定要清除所有数据吗？此操作不可恢复！',
        confirmText: '确认清除',
        confirmColor: '#F87171',
        success: (res) => {
          if (res.confirm) {
            store.clearAll()
            this.loadDataInfo()
            uni.showToast({ title: '数据已清除', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #FFF0F5;
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.section-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 24rpx;
  display: block;
  line-height: 1.6;
}

.export-btn, .import-btn {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
}

.clipboard-btns {
  display: flex;
  gap: 16rpx;

  button {
    flex: 1;
    height: 80rpx;
    font-size: 26rpx;
  }
}

.data-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.danger-section {
  border: 2rpx solid #FECACA;
}

.delete-btn {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
  color: #F87171;
  background: #FFF5F5;
  border: 2rpx solid #FECACA;
  border-radius: 48rpx;
  &::after {
    border: none;
  }
}
</style>
