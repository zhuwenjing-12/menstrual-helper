<template>
  <view class="page-container">
    <!-- 顶部状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="greeting">{{ greeting }}</text>
        <text class="date-text">{{ todayText }}</text>
      </view>
      <view class="status-body">
        <view class="status-icon" :style="{ background: statusGradient }">
          <text class="icon-emoji">{{ statusEmoji }}</text>
        </view>
        <view class="status-info">
          <text class="status-title">{{ statusTitle }}</text>
          <text class="status-desc">{{ statusDesc }}</text>
        </view>
      </view>
      <!-- 倒计时进度条 -->
      <view class="countdown-bar" v-if="nextPeriod">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="countdown-text">{{ countdownText }}</text>
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="quick-actions card">
      <text class="section-title">快速记录</text>
      <view class="action-buttons">
        <view
          class="action-btn"
          :class="{ active: isPeriodActive }"
          @tap="togglePeriod"
        >
          <text class="action-icon">{{ isPeriodActive ? '🩸' : '💧' }}</text>
          <text class="action-text">{{ isPeriodActive ? '结束经期' : '开始经期' }}</text>
        </view>
        <view class="action-btn" @tap="goToRecord">
          <text class="action-icon">📝</text>
          <text class="action-text">详细记录</text>
        </view>
        <view class="action-btn" @tap="goToCalendar">
          <text class="action-icon">📅</text>
          <text class="action-text">查看日历</text>
        </view>
      </view>
      <view class="action-buttons" style="margin-top: 16rpx;">
        <view class="action-btn" @tap="goToReminder">
          <text class="action-icon">⏰</text>
          <text class="action-text">经期提醒</text>
        </view>
        <view class="action-btn" @tap="goToDelivery">
          <text class="action-icon">📦</text>
          <text class="action-text">姨妈巾速送</text>
        </view>
        <view class="action-btn" @tap="goToStats">
          <text class="action-icon">📊</text>
          <text class="action-text">数据统计</text>
        </view>
      </view>
    </view>

    <!-- 今日信息 -->
    <view class="today-info card">
      <text class="section-title">今日信息</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-value" :style="{ color: '#FF6B9D' }">{{ cycleDay }}</text>
          <text class="info-label">周期第几天</text>
        </view>
        <view class="info-item">
          <text class="info-value" :style="{ color: '#C084FC' }">{{ periodDaysLeft }}</text>
          <text class="info-label">距下次经期</text>
        </view>
        <view class="info-item">
          <text class="info-value" :style="{ color: '#4ADE80' }">{{ avgCycle }}</text>
          <text class="info-label">平均周期</text>
        </view>
        <view class="info-item">
          <text class="info-value" :style="{ color: '#FBBF24' }">{{ stabilityScore }}</text>
          <text class="info-label">稳定评分</text>
        </view>
      </view>
    </view>

    <!-- 近期预测 -->
    <view class="prediction card" v-if="nextPeriod">
      <text class="section-title">近期预测</text>
      <view class="prediction-list">
        <view class="prediction-item">
          <view class="pred-dot" style="background: #FF6B9D;"></view>
          <text class="pred-label">下次经期</text>
          <text class="pred-date">{{ nextPeriod.startDate }}</text>
        </view>
        <view class="prediction-item" v-if="ovulation">
          <view class="pred-dot" style="background: #FBBF24;"></view>
          <text class="pred-label">排卵日</text>
          <text class="pred-date">{{ ovulation.date }}</text>
        </view>
        <view class="prediction-item" v-if="ovulation">
          <view class="pred-dot" style="background: #4ADE80;"></view>
          <text class="pred-label">易孕期</text>
          <text class="pred-date">{{ ovulation.fertileStart }} ~ {{ ovulation.fertileEnd }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态提示 -->
    <view class="empty-state card" v-if="records.length === 0">
      <text class="empty-icon">🌸</text>
      <text class="empty-title">欢迎使用月经助手</text>
      <text class="empty-desc">点击下方按钮开始记录您的第一个经期</text>
      <button class="btn-primary" @tap="goToRecord">开始记录</button>
    </view>

    <!-- 异常提醒 -->
    <view class="anomaly-card card" v-if="anomalies.length > 0">
      <text class="section-title">⚠️ 健康提醒</text>
      <view class="anomaly-list">
        <text class="anomaly-item" v-for="(item, index) in anomalies" :key="index">
          {{ item.message }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate, getToday, daysBetween, formatDateCN } from '../../utils/date'
import { predictNextPeriod, predictOvulation, getDateStatus, detectAnomalies, calcStabilityScore, calcAverageCycle } from '../../utils/prediction'
import { scheduleReminders } from '../../utils/reminder'
import store from '../../store'

export default {
  data() {
    return {
      records: [],
      settings: {},
      today: getToday()
    }
  },
  computed: {
    greeting() {
      const hour = new Date().getHours()
      if (hour < 6) return '夜深了 🌙'
      if (hour < 12) return '早上好 ☀️'
      if (hour < 18) return '下午好 🌤'
      return '晚上好 🌙'
    },
    todayText() {
      const d = new Date()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`
    },
    isPeriodActive() {
      if (this.records.length === 0) return false
      const sorted = this.records.slice().sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      const last = sorted[0]
      if (!last.endDate) return true
      return last.endDate >= this.today
    },
    nextPeriod() {
      return predictNextPeriod(this.records, this.settings.cycleLength)
    },
    ovulation() {
      return predictOvulation(this.records, this.settings.cycleLength)
    },
    statusEmoji() {
      if (this.records.length === 0) return '🌸'
      if (this.isPeriodActive) return '🩸'
      if (this.nextPeriod && this.nextPeriod.daysUntil <= 3) return '⏰'
      return '💚'
    },
    statusGradient() {
      if (this.isPeriodActive) return 'linear-gradient(135deg, #FF6B9D, #FF8EB5)'
      if (this.nextPeriod && this.nextPeriod.daysUntil <= 3) return 'linear-gradient(135deg, #FBBF24, #FCD34D)'
      return 'linear-gradient(135deg, #4ADE80, #86EFAC)'
    },
    statusTitle() {
      if (this.records.length === 0) return '开始记录'
      if (this.isPeriodActive) return '经期中'
      if (this.nextPeriod) {
        if (this.nextPeriod.daysUntil <= 0) return '经期即将到来'
        if (this.nextPeriod.daysUntil <= 3) return '经期即将来临'
        return '安全期'
      }
      return '暂无数据'
    },
    statusDesc() {
      if (this.records.length === 0) return '记录您的第一个经期，开始健康之旅'
      if (this.isPeriodActive) return '注意保暖，好好休息哦'
      if (this.nextPeriod) {
        if (this.nextPeriod.daysUntil <= 0) return '经期马上就要来了，做好准备吧'
        if (this.nextPeriod.daysUntil <= 3) return `还有${this.nextPeriod.daysUntil}天到来`
        return `距离下次经期还有${this.nextPeriod.daysUntil}天`
      }
      return '继续记录以获得准确预测'
    },
    progressPercent() {
      if (!this.nextPeriod) return 0
      const cycle = this.nextPeriod.cycleLength || 28
      const elapsed = cycle - this.nextPeriod.daysUntil
      return Math.min(100, Math.max(0, (elapsed / cycle) * 100))
    },
    countdownText() {
      if (!this.nextPeriod) return ''
      if (this.nextPeriod.daysUntil <= 0) return '即将到来'
      return `还有 ${this.nextPeriod.daysUntil} 天`
    },
    cycleDay() {
      if (this.records.length === 0) return '-'
      const sorted = this.records.slice().sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      const last = sorted[0]
      return daysBetween(last.startDate, this.today) + 1
    },
    periodDaysLeft() {
      if (!this.nextPeriod) return '-'
      return this.nextPeriod.daysUntil > 0 ? this.nextPeriod.daysUntil + '天' : '即将到来'
    },
    avgCycle() {
      if (this.records.length < 2) return '-'
      return (this.settings.cycleLength || 28) + '天'
    },
    stabilityScore() {
      const score = calcStabilityScore(this.records)
      return score > 0 ? score + '分' : '-'
    },
    anomalies() {
      return detectAnomalies(this.records)
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.records = store.records || []
      this.settings = store.settings || {}
      // 自动调度经期提醒
      scheduleReminders(this.records, this.settings)
    },
    togglePeriod() {
      if (this.isPeriodActive) {
        // 结束经期
        const sorted = this.records.slice().sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        const last = sorted[0]
        if (last && !last.endDate) {
          store.updateRecord(last.id, { endDate: this.today })
          uni.showToast({ title: '经期已结束', icon: 'success' })
          this.loadData()
        }
      } else {
        // 开始经期
        store.addRecord({
          startDate: this.today,
          endDate: '',
          flow: 'medium',
          color: '',
          pain: 0,
          symptoms: [],
          mood: '',
          notes: ''
        })
        uni.showToast({ title: '经期已开始记录', icon: 'success' })
        this.loadData()
      }
    },
    goToRecord() {
      uni.switchTab({ url: '/pages/record/index' })
    },
    goToCalendar() {
      uni.switchTab({ url: '/pages/calendar/index' })
    },
    goToDelivery() {
      uni.navigateTo({ url: '/pages-sub/delivery/index' })
    },
    goToStats() {
      uni.navigateTo({ url: '/pages-sub/stats/index' })
    },
    goToReminder() {
      uni.navigateTo({ url: '/pages-sub/reminder/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.status-card {
  margin: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #FFE4EF, #F3E8FF);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 157, 0.15);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.greeting {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.date-text {
  font-size: 24rpx;
  color: #666;
}

.status-body {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.status-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon-emoji {
  font-size: 48rpx;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.countdown-bar {
  margin-top: 8rpx;
}

.progress-track {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #C084FC);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.countdown-text {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  display: block;
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

.quick-actions {
  .action-buttons {
    display: flex;
    justify-content: space-around;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx;
    border-radius: 20rpx;
    background: #FFF5F8;
    min-width: 160rpx;
    transition: all 0.2s;

    &:active {
      transform: scale(0.95);
      background: #FFE4EF;
    }

    &.active {
      background: #FFE4EF;
      border: 2rpx solid #FFB3CC;
    }
  }

  .action-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }

  .action-text {
    font-size: 24rpx;
    color: #666;
  }
}

.info-grid {
  display: flex;
  justify-content: space-around;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-value {
  font-size: 44rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 22rpx;
  color: #999;
}

.prediction-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.prediction-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #FFF0F5;
}

.prediction-item:last-child {
  border-bottom: none;
}

.pred-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.pred-label {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.pred-date {
  font-size: 26rpx;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 32rpx;
  text-align: center;
}

.anomaly-card {
  .anomaly-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .anomaly-item {
    font-size: 26rpx;
    color: #F87171;
    padding: 12rpx 16rpx;
    background: #FFF5F5;
    border-radius: 12rpx;
    display: block;
  }
}
</style>
