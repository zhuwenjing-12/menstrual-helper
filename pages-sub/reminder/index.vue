<template>
  <view class="page-container">
    <!-- 测试按钮 -->
    <view class="test-card card">
      <text class="test-title">🔔 测试提醒</text>
      <text class="test-desc">点击按钮测试通知是否能正常响铃</text>
      <button class="btn-primary test-btn" @tap="testAlarm">测试闹钟（2秒后响）</button>
    </view>

    <!-- 经期提醒 -->
    <view class="section card">
      <text class="section-title">🩸 经期提醒</text>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">经期即将到来</text>
          <text class="setting-hint">提前{{ settings.periodSoonDays }}天提醒</text>
        </view>
        <switch :checked="settings.enablePeriodSoon" @change="onToggle('enablePeriodSoon', $event)" color="#FF6B9D" />
      </view>

      <view class="setting-item sub-item" v-if="settings.enablePeriodSoon">
        <text class="setting-label">提前提醒天数</text>
        <view class="setting-control">
          <view class="ctrl-btn" @tap="adjustDays(-1)"><text class="ctrl-icon">−</text></view>
          <text class="ctrl-value">{{ settings.periodSoonDays }}天</text>
          <view class="ctrl-btn" @tap="adjustDays(1)"><text class="ctrl-icon">+</text></view>
        </view>
      </view>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">经期当天提醒</text>
          <text class="setting-hint">预测经期当天早上8点提醒</text>
        </view>
        <switch :checked="settings.enablePeriodToday" @change="onToggle('enablePeriodToday', $event)" color="#FF6B9D" />
      </view>
    </view>

    <!-- 排卵提醒 -->
    <view class="section card">
      <text class="section-title">🌟 排卵提醒</text>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">排卵日提醒</text>
          <text class="setting-hint">排卵日当天提醒</text>
        </view>
        <switch :checked="settings.enableOvulation" @change="onToggle('enableOvulation', $event)" color="#FF6B9D" />
      </view>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">易孕期提醒</text>
          <text class="setting-hint">进入易孕期时提醒</text>
        </view>
        <switch :checked="settings.enableFertile" @change="onToggle('enableFertile', $event)" color="#FF6B9D" />
      </view>
    </view>

    <!-- 每日提醒 -->
    <view class="section card">
      <text class="section-title">📝 每日提醒</text>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">每日记录提醒</text>
          <text class="setting-hint">每天提醒记录身体状况</text>
        </view>
        <switch :checked="settings.enableDailyRecord" @change="onToggle('enableDailyRecord', $event)" color="#FF6B9D" />
      </view>

      <view class="setting-item sub-item" v-if="settings.enableDailyRecord">
        <text class="setting-label">提醒时间</text>
        <picker mode="time" :value="settings.dailyRecordTime" @change="onTimeChange('dailyRecordTime', $event)">
          <text class="time-picker">{{ settings.dailyRecordTime }}</text>
        </picker>
      </view>
    </view>

    <!-- 闹钟设置 -->
    <view class="section card">
      <text class="section-title">⏰ 闹钟模式</text>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">响铃提醒</text>
          <text class="setting-hint">通知时播放系统铃声</text>
        </view>
        <switch :checked="settings.soundEnabled" @change="onToggle('soundEnabled', $event)" color="#FF6B9D" />
      </view>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">振动提醒</text>
          <text class="setting-hint">通知时手机振动</text>
        </view>
        <switch :checked="settings.vibrateEnabled" @change="onToggle('vibrateEnabled', $event)" color="#FF6B9D" />
      </view>

      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-label">闹钟模式</text>
          <text class="setting-hint">重要提醒持续响铃+振动</text>
        </view>
        <switch :checked="settings.alarmEnabled" @change="onToggle('alarmEnabled', $event)" color="#FF6B9D" />
      </view>
    </view>

    <!-- 保存 -->
    <view class="save-section">
      <button class="btn-primary save-btn" @tap="saveAndSchedule">保存并启用提醒</button>
    </view>
  </view>
</template>

<script>
import { getReminderSettings, saveReminderSettings, testNotification, scheduleReminders, requestNotificationPermission } from '../../utils/reminder'
import store from '../../store'

export default {
  data() {
    return {
      settings: {}
    }
  },
  onLoad() {
    this.settings = getReminderSettings()
  },
  methods: {
    onToggle(key, e) {
      this.settings[key] = e.detail.value
    },
    onTimeChange(key, e) {
      this.settings[key] = e.detail.value
    },
    adjustDays(delta) {
      const newVal = this.settings.periodSoonDays + delta
      if (newVal >= 1 && newVal <= 7) {
        this.settings.periodSoonDays = newVal
      }
    },
    testAlarm() {
      uni.showToast({ title: '2秒后响铃...', icon: 'none', duration: 1500 })
      testNotification()
    },
    async saveAndSchedule() {
      // 请求通知权限
      const granted = await requestNotificationPermission()
      if (!granted) {
        uni.showModal({
          title: '需要通知权限',
          content: '请在系统设置中开启本应用的通知权限，否则无法收到提醒。',
          confirmText: '去设置',
          confirmColor: '#FF6B9D',
          success: (res) => {
            if (res.confirm) {
              // #ifdef APP-PLUS
              const main = plus.android.runtimeMainActivity()
              const Intent = plus.android.importClass('android.content.Intent')
              const Settings = plus.android.importClass('android.provider.Settings')
              const intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
              intent.putExtra(Settings.EXTRA_APP_PACKAGE, main.getPackageName())
              main.startActivity(intent)
              // #endif
            }
          }
        })
        return
      }

      saveReminderSettings(this.settings)

      // 调度提醒
      const records = store.records || []
      const settings = store.settings || {}
      scheduleReminders(records, settings)

      uni.showToast({ title: '提醒已开启 ✅', icon: 'success' })
      setTimeout(() => { uni.navigateBack() }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container { min-height:100vh; padding-bottom:40rpx; background:#FFF0F5; }

.card { background:#FFF; border-radius:24rpx; padding:28rpx; margin:24rpx; margin-bottom:0; box-shadow:0 4rpx 20rpx rgba(255,107,157,0.08); }

.test-card { text-align:center; }
.test-title { font-size:32rpx; font-weight:700; color:#333; display:block; margin-bottom:8rpx; }
.test-desc { font-size:24rpx; color:#999; display:block; margin-bottom:20rpx; }
.test-btn { width:100%; height:88rpx; font-size:28rpx; }

.section-title { font-size:28rpx; font-weight:700; color:#333; display:block; margin-bottom:16rpx; }

.setting-item { display:flex; justify-content:space-between; align-items:center; padding:20rpx 0; border-bottom:1rpx solid #FFF0F5;
  &:last-child { border-bottom:none; }
  &.sub-item { padding-left:24rpx; }
}
.setting-left { flex:1; }
.setting-label { font-size:28rpx; color:#333; display:block; }
.setting-hint { font-size:22rpx; color:#999; display:block; margin-top:4rpx; }
.setting-control { display:flex; align-items:center; gap:12rpx; }
.ctrl-btn { width:52rpx; height:52rpx; border-radius:26rpx; background:#FFF0F5; display:flex; align-items:center; justify-content:center; &:active{background:#FFE4EF;} }
.ctrl-icon { font-size:28rpx; color:#FF6B9D; font-weight:700; }
.ctrl-value { font-size:28rpx; font-weight:700; color:#FF6B9D; min-width:60rpx; text-align:center; }
.time-picker { font-size:30rpx; font-weight:600; color:#FF6B9D; background:#FFF0F5; padding:10rpx 24rpx; border-radius:16rpx; }

.save-section { padding:32rpx 24rpx; }
.save-btn { width:100%; height:96rpx; font-size:32rpx; }
</style>
