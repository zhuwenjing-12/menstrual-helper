<template>
  <view class="page-container">
    <!-- 用户头像区域 -->
    <view class="profile-header">
      <view class="avatar">
        <text class="avatar-text">🌸</text>
      </view>
      <text class="nickname">{{ userInfo.nickname || '月经助手用户' }}</text>
      <text class="record-count">已记录 {{ records.length }} 次经期</text>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @tap="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToReminder">
        <text class="menu-icon">⏰</text>
        <text class="menu-text">经期提醒</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToLock">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私密码</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToBackup">
        <text class="menu-icon">💾</text>
        <text class="menu-text">数据备份</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToStats">
        <text class="menu-icon">📊</text>
        <text class="menu-text">数据统计</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToAI">
        <text class="menu-icon">🤖</text>
        <text class="menu-text">AI 健康助手</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="data-section card">
      <text class="section-title">数据统计</text>
      <view class="data-grid">
        <view class="data-item">
          <text class="data-value">{{ records.length }}</text>
          <text class="data-label">总记录</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ avgCycle }}</text>
          <text class="data-label">平均周期</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ storageSize }}</text>
          <text class="data-label">数据大小</text>
        </view>
      </view>
    </view>

    <!-- 危险操作 -->
    <view class="danger-section card">
      <view class="danger-item" @tap="clearData">
        <text class="danger-icon">🗑️</text>
        <text class="danger-text">清除所有数据</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">月经助手 v1.0.0</text>
      <text class="version-sub">纯本地存储 · 无广告 · 保护隐私</text>
    </view>
  </view>
</template>

<script>
import store from '../../store'

export default {
  data() {
    return {
      records: [],
      userInfo: {},
      settings: {}
    }
  },
  computed: {
    avgCycle() {
      if (this.records.length < 2) return '-'
      return (this.settings.cycleLength || 28) + '天'
    },
    storageSize() {
      try {
        const info = uni.getStorageInfoSync()
        return (info.currentSize || 0) + 'KB'
      } catch (e) {
        return '未知'
      }
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.records = store.records || []
      this.userInfo = store.userInfo || {}
      this.settings = store.settings || {}
    },
    goToSettings() {
      uni.navigateTo({ url: '/pages-sub/settings/index' })
    },
    goToReminder() {
      uni.navigateTo({ url: '/pages-sub/reminder/index' })
    },
    goToLock() {
      uni.navigateTo({ url: '/pages-sub/lock/index' })
    },
    goToBackup() {
      uni.navigateTo({ url: '/pages-sub/backup/index' })
    },
    goToAbout() {
      uni.navigateTo({ url: '/pages-sub/about/index' })
    },
    goToStats() {
      uni.navigateTo({ url: '/pages-sub/stats/index' })
    },
    goToAI() {
      uni.switchTab({ url: '/pages/ai/index' })
    },
    clearData() {
      uni.showModal({
        title: '⚠️ 警告',
        content: '确定要清除所有数据吗？此操作不可恢复！',
        confirmText: '确认清除',
        confirmColor: '#F87171',
        success: (res) => {
          if (res.confirm) {
            store.clearAll()
            this.loadData()
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
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #FFE4EF, #F3E8FF);
  margin-bottom: 24rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.2);
}

.avatar-text {
  font-size: 64rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}

.record-count {
  font-size: 26rpx;
  color: #666;
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.menu-section {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FFF5F8;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #CCC;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.data-grid {
  display: flex;
  justify-content: space-around;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #FF6B9D;
  margin-bottom: 8rpx;
}

.data-label {
  font-size: 24rpx;
  color: #999;
}

.danger-section {
  padding: 0;
}

.danger-item {
  display: flex;
  align-items: center;
  padding: 32rpx;

  &:active {
    background: #FFF5F5;
  }
}

.danger-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.danger-text {
  font-size: 30rpx;
  color: #F87171;
}

.version-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
}

.version-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.version-sub {
  font-size: 22rpx;
  color: #CCC;
}
</style>
