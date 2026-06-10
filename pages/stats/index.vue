<template>
  <view class="page-container">
    <!-- 概览卡片 -->
    <view class="overview-card card">
      <text class="section-title">📊 数据概览</text>
      <view class="overview-grid">
        <view class="overview-item">
          <view class="overview-circle" style="background: linear-gradient(135deg, #FF6B9D, #FF8EB5);">
            <text class="overview-value">{{ totalRecords }}</text>
          </view>
          <text class="overview-label">总记录次数</text>
        </view>
        <view class="overview-item">
          <view class="overview-circle" style="background: linear-gradient(135deg, #C084FC, #D8B4FE);">
            <text class="overview-value">{{ avgCycle }}</text>
          </view>
          <text class="overview-label">平均周期(天)</text>
        </view>
        <view class="overview-item">
          <view class="overview-circle" style="background: linear-gradient(135deg, #4ADE80, #86EFAC);">
            <text class="overview-value">{{ avgPeriod }}</text>
          </view>
          <text class="overview-label">平均经期(天)</text>
        </view>
        <view class="overview-item">
          <view class="overview-circle" style="background: linear-gradient(135deg, #FBBF24, #FCD34D);">
            <text class="overview-value">{{ stabilityScore }}</text>
          </view>
          <text class="overview-label">稳定评分</text>
        </view>
      </view>
    </view>

    <!-- 周期长度图表 -->
    <view class="chart-card card">
      <text class="section-title">📈 周期长度变化</text>
      <view class="chart-container" v-if="cycleHistory.length > 0">
        <view class="bar-chart">
          <view class="bar-item" v-for="(item, index) in cycleHistory" :key="index">
            <view class="bar-wrapper">
              <view
                class="bar-fill"
                :style="{
                  height: (item.value / maxCycle) * 100 + '%',
                  background: item.value >= 25 && item.value <= 35 ? '#4ADE80' : '#FF6B9D'
                }"
              >
                <text class="bar-value">{{ item.value }}</text>
              </view>
            </view>
            <text class="bar-label">{{ item.label }}</text>
          </view>
        </view>
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-dot" style="background: #4ADE80;"></view>
            <text class="legend-text">正常范围(25-35天)</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot" style="background: #FF6B9D;"></view>
            <text class="legend-text">异常范围</text>
          </view>
        </view>
      </view>
      <view class="empty-chart" v-else>
        <text class="empty-text">需要至少2次记录才能生成图表</text>
      </view>
    </view>

    <!-- 经期天数图表 -->
    <view class="chart-card card">
      <text class="section-title">📅 经期天数变化</text>
      <view class="chart-container" v-if="periodHistory.length > 0">
        <view class="bar-chart">
          <view class="bar-item" v-for="(item, index) in periodHistory" :key="index">
            <view class="bar-wrapper">
              <view
                class="bar-fill"
                :style="{
                  height: (item.value / maxPeriod) * 100 + '%',
                  background: item.value >= 3 && item.value <= 7 ? '#C084FC' : '#FF6B9D'
                }"
              >
                <text class="bar-value">{{ item.value }}</text>
              </view>
            </view>
            <text class="bar-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
      <view class="empty-chart" v-else>
        <text class="empty-text">需要至少2次记录才能生成图表</text>
      </view>
    </view>

    <!-- 周期稳定性分析 -->
    <view class="stability-card card">
      <text class="section-title">🎯 周期稳定性分析</text>
      <view class="stability-body" v-if="records.length >= 3">
        <view class="stability-meter">
          <view class="meter-track">
            <view class="meter-fill" :style="{ width: stabilityScore + '%' }"></view>
          </view>
          <view class="meter-labels">
            <text class="meter-label">不稳定</text>
            <text class="meter-label">一般</text>
            <text class="meter-label">稳定</text>
          </view>
        </view>
        <view class="stability-desc">
          <text class="desc-text">{{ stabilityDesc }}</text>
        </view>
      </view>
      <view class="empty-chart" v-else>
        <text class="empty-text">需要至少3次记录才能分析稳定性</text>
      </view>
    </view>

    <!-- 异常提醒 -->
    <view class="anomaly-card card" v-if="anomalies.length > 0">
      <text class="section-title">⚠️ 异常提醒</text>
      <view class="anomaly-list">
        <view class="anomaly-item" v-for="(item, index) in anomalies" :key="index">
          <text class="anomaly-icon">{{ item.type === 'late' || item.type === 'long-period' ? '🔴' : '🟡' }}</text>
          <text class="anomaly-text">{{ item.message }}</text>
        </view>
      </view>
    </view>

    <!-- 数据不足提示 -->
    <view class="insufficient-card card" v-if="records.length < 2">
      <text class="insufficient-icon">📝</text>
      <text class="insufficient-title">数据不足</text>
      <text class="insufficient-desc">至少需要2次经期记录才能生成统计数据。继续记录以获得更准确的分析。</text>
    </view>
  </view>
</template>

<script>
import { formatDate, daysBetween } from '../../utils/date'
import { calcAverageCycle, calcAveragePeriod, calcStabilityScore, detectAnomalies } from '../../utils/prediction'
import store from '../../store'

export default {
  data() {
    return {
      records: [],
      settings: {}
    }
  },
  computed: {
    totalRecords() {
      return this.records.length
    },
    avgCycle() {
      if (this.records.length < 2) return '-'
      return calcAverageCycle(this.records)
    },
    avgPeriod() {
      if (this.records.length === 0) return '-'
      return calcAveragePeriod(this.records)
    },
    stabilityScore() {
      return calcStabilityScore(this.records)
    },
    stabilityDesc() {
      const score = this.stabilityScore
      if (score >= 90) return '您的周期非常规律，预测准确度很高。'
      if (score >= 70) return '您的周期比较规律，偶尔有波动属于正常现象。'
      if (score >= 50) return '您的周期有一定波动，建议持续记录以获得更准确的预测。'
      return '您的周期波动较大，建议关注身体变化，必要时咨询医生。'
    },
    cycleHistory() {
      if (this.records.length < 2) return []
      const sorted = this.records
        .slice()
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

      const result = []
      for (let i = 1; i < sorted.length; i++) {
        const diff = daysBetween(sorted[i - 1].startDate, sorted[i].startDate)
        if (diff >= 15 && diff <= 60) {
          const d = new Date(sorted[i].startDate)
          result.push({
            value: diff,
            label: (d.getMonth() + 1) + '/' + d.getDate()
          })
        }
      }
      return result.slice(-10) // 最近10次
    },
    maxCycle() {
      if (this.cycleHistory.length === 0) return 35
      return Math.max(...this.cycleHistory.map(c => c.value), 35)
    },
    periodHistory() {
      if (this.records.length === 0) return []
      return this.records
        .filter(r => r.endDate)
        .map(r => {
          const days = daysBetween(r.startDate, r.endDate) + 1
          const d = new Date(r.startDate)
          return {
            value: days,
            label: (d.getMonth() + 1) + '/' + d.getDate()
          }
        })
        .slice(-10)
    },
    maxPeriod() {
      if (this.periodHistory.length === 0) return 7
      return Math.max(...this.periodHistory.map(p => p.value), 7)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
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

.overview-grid {
  display: flex;
  justify-content: space-around;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overview-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.overview-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.overview-label {
  font-size: 22rpx;
  color: #999;
}

.chart-container {
  padding: 16rpx 0;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 300rpx;
  padding-bottom: 40rpx;
  position: relative;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  height: 240rpx;
  width: 40rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-fill {
  width: 100%;
  border-radius: 8rpx 8rpx 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 8rpx;
  position: relative;
  transition: height 0.3s;
}

.bar-value {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 700;
  position: absolute;
  top: -28rpx;
}

.bar-label {
  font-size: 18rpx;
  color: #999;
  margin-top: 8rpx;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
}

.legend-text {
  font-size: 22rpx;
  color: #666;
}

.empty-chart {
  padding: 40rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.stability-meter {
  margin-bottom: 24rpx;
}

.meter-track {
  height: 24rpx;
  background: #FFF0F5;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #FBBF24, #4ADE80);
  border-radius: 12rpx;
  transition: width 0.5s;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
}

.meter-label {
  font-size: 20rpx;
  color: #999;
}

.stability-desc {
  padding: 16rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}

.anomaly-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.anomaly-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #FFF5F5;
  border-radius: 16rpx;
}

.anomaly-icon {
  font-size: 28rpx;
}

.anomaly-text {
  font-size: 26rpx;
  color: #666;
}

.insufficient-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  text-align: center;
}

.insufficient-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.insufficient-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
}

.insufficient-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
}
</style>
