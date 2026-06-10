<template>
  <view class="page-container">
    <!-- 周期设置 -->
    <view class="section card">
      <text class="section-title">周期设置</text>

      <view class="setting-item">
        <text class="setting-label">平均周期天数</text>
        <view class="setting-control">
          <view class="control-btn" @tap="adjustCycle(-1)">
            <text class="control-icon">−</text>
          </view>
          <text class="control-value">{{ settings.cycleLength }}天</text>
          <view class="control-btn" @tap="adjustCycle(1)">
            <text class="control-icon">+</text>
          </view>
        </view>
      </view>

      <view class="setting-item">
        <text class="setting-label">平均经期天数</text>
        <view class="setting-control">
          <view class="control-btn" @tap="adjustPeriod(-1)">
            <text class="control-icon">−</text>
          </view>
          <text class="control-value">{{ settings.periodLength }}天</text>
          <view class="control-btn" @tap="adjustPeriod(1)">
            <text class="control-icon">+</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提醒设置 -->
    <view class="section card">
      <text class="section-title">提醒设置</text>

      <view class="setting-item">
        <text class="setting-label">经期提醒</text>
        <switch
          :checked="settings.enableRemind"
          @change="onRemindChange"
          color="#FF6B9D"
        />
      </view>

      <view class="setting-item" v-if="settings.enableRemind">
        <text class="setting-label">提前提醒天数</text>
        <view class="setting-control">
          <view class="control-btn" @tap="adjustRemind(-1)">
            <text class="control-icon">−</text>
          </view>
          <text class="control-value">{{ settings.remindBefore }}天</text>
          <view class="control-btn" @tap="adjustRemind(1)">
            <text class="control-icon">+</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="section card">
      <text class="section-title">个人信息</text>

      <view class="setting-item">
        <text class="setting-label">昵称</text>
        <input
          class="setting-input"
          v-model="userInfo.nickname"
          placeholder="请输入昵称"
          placeholder-class="input-placeholder"
          @blur="saveUserInfo"
        />
      </view>
    </view>

    <!-- 保存提示 -->
    <view class="save-section">
      <button class="btn-primary save-btn" @tap="saveSettings">保存设置</button>
    </view>
  </view>
</template>

<script>
import store from '../../store'

export default {
  data() {
    return {
      settings: {
        cycleLength: 28,
        periodLength: 5,
        remindBefore: 2,
        enableRemind: true
      },
      userInfo: {
        nickname: ''
      }
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.settings = { ...store.settings }
      this.userInfo = { ...store.userInfo }
    },
    adjustCycle(delta) {
      const newVal = this.settings.cycleLength + delta
      if (newVal >= 20 && newVal <= 45) {
        this.settings.cycleLength = newVal
      }
    },
    adjustPeriod(delta) {
      const newVal = this.settings.periodLength + delta
      if (newVal >= 2 && newVal <= 12) {
        this.settings.periodLength = newVal
      }
    },
    adjustRemind(delta) {
      const newVal = this.settings.remindBefore + delta
      if (newVal >= 1 && newVal <= 7) {
        this.settings.remindBefore = newVal
      }
    },
    onRemindChange(e) {
      this.settings.enableRemind = e.detail.value
    },
    saveUserInfo() {
      store.updateUserInfo(this.userInfo)
    },
    saveSettings() {
      store.updateSettings(this.settings)
      store.updateUserInfo(this.userInfo)
      uni.showToast({ title: '设置已保存', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
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
  margin-bottom: 24rpx;
  display: block;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.control-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF0F5;
  border-radius: 28rpx;

  &:active {
    background: #FFE4EF;
  }
}

.control-icon {
  font-size: 32rpx;
  color: #FF6B9D;
  font-weight: 700;
}

.control-value {
  font-size: 30rpx;
  font-weight: 700;
  color: #FF6B9D;
  min-width: 80rpx;
  text-align: center;
}

.setting-input {
  text-align: right;
  font-size: 28rpx;
  color: #333;
  flex: 1;
  margin-left: 20rpx;
}

.input-placeholder {
  color: #CCC;
}

.save-section {
  padding: 32rpx 24rpx;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  font-size: 32rpx;
}
</style>
