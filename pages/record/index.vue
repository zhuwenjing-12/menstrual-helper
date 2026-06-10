<template>
  <view class="page-container">
    <!-- 添加记录按钮 -->
    <view class="add-section">
      <button class="btn-primary add-btn" @tap="addNewRecord">
        <text class="btn-icon">+</text>
        <text>添加经期记录</text>
      </button>
    </view>

    <!-- 当前经期状态 -->
    <view class="current-period card" v-if="currentRecord">
      <view class="period-header">
        <text class="period-badge">🩸 经期中</text>
        <text class="period-days">第 {{ currentDays }} 天</text>
      </view>
      <view class="period-info">
        <text class="period-date">开始：{{ currentRecord.startDate }}</text>
      </view>
      <button class="btn-secondary end-btn" @tap="endCurrentPeriod">结束经期</button>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-section">
      <text class="section-title">历史记录</text>

      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无记录</text>
        <text class="empty-hint">点击上方按钮开始记录</text>
      </view>

      <view class="record-list" v-else>
        <view
          class="record-item card"
          v-for="record in sortedRecords"
          :key="record.id"
          @tap="editRecord(record)"
        >
          <view class="record-header">
            <view class="record-date-range">
              <text class="record-start">{{ formatDateDisplay(record.startDate) }}</text>
              <text class="record-arrow" v-if="record.endDate"> → </text>
              <text class="record-end" v-if="record.endDate">{{ formatDateDisplay(record.endDate) }}</text>
            </view>
            <view class="record-duration" v-if="record.endDate">
              {{ daysBetween(record.startDate, record.endDate) + 1 }}天
            </view>
            <view class="record-ongoing" v-else>
              进行中
            </view>
          </view>

          <view class="record-details">
            <view class="detail-tag" v-if="record.flow">
              <text class="tag-icon">💧</text>
              <text>{{ flowText(record.flow) }}</text>
            </view>
            <view class="detail-tag" v-if="record.pain > 0">
              <text class="tag-icon">😣</text>
              <text>{{ painText(record.pain) }}</text>
            </view>
            <view class="detail-tag" v-if="record.mood">
              <text class="tag-icon">😊</text>
              <text>{{ record.mood }}</text>
            </view>
          </view>

          <view class="record-symptoms" v-if="record.symptoms && record.symptoms.length > 0">
            <text class="symptom-tag" v-for="(s, i) in record.symptoms" :key="i">{{ s }}</text>
          </view>

          <view class="record-notes" v-if="record.notes">
            <text class="notes-text">{{ record.notes }}</text>
          </view>

          <view class="record-actions">
            <view class="action-edit" @tap.stop="editRecord(record)">
              <text>编辑</text>
            </view>
            <view class="action-delete" @tap.stop="deleteRecord(record)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate, getToday, daysBetween, formatDateCN } from '../../utils/date'
import store from '../../store'

export default {
  data() {
    return {
      records: []
    }
  },
  computed: {
    sortedRecords() {
      return this.records
        .slice()
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    },
    currentRecord() {
      const today = getToday()
      return this.records.find(r => {
        if (!r.endDate) return true
        return r.endDate >= today && r.startDate <= today
      })
    },
    currentDays() {
      if (!this.currentRecord) return 0
      return daysBetween(this.currentRecord.startDate, getToday()) + 1
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.records = store.records || []
    },
    addNewRecord() {
      uni.navigateTo({
        url: '/pages-sub/record-add/index'
      })
    },
    editRecord(record) {
      uni.navigateTo({
        url: '/pages-sub/record-add/index?id=' + record.id
      })
    },
    endCurrentPeriod() {
      if (this.currentRecord) {
        store.updateRecord(this.currentRecord.id, { endDate: getToday() })
        uni.showToast({ title: '经期已结束', icon: 'success' })
        this.loadData()
      }
    },
    deleteRecord(record) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        confirmColor: '#FF6B9D',
        success: (res) => {
          if (res.confirm) {
            store.deleteRecord(record.id)
            uni.showToast({ title: '已删除', icon: 'success' })
            this.loadData()
          }
        }
      })
    },
    formatDateDisplay(date) {
      return formatDateCN(date)
    },
    daysBetween(d1, d2) {
      return daysBetween(d1, d2)
    },
    flowText(flow) {
      const map = { light: '少量', medium: '中等', heavy: '大量' }
      return map[flow] || '中等'
    },
    painText(pain) {
      const levels = ['无', '轻微', '中等', '明显', '严重', '剧烈']
      return levels[pain] || '无'
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.add-section {
  padding: 24rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 96rpx;
  font-size: 32rpx;
}

.btn-icon {
  font-size: 40rpx;
  font-weight: 700;
}

.current-period {
  margin: 0 24rpx 24rpx;
  border: 2rpx solid #FFD6E7;
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.period-badge {
  font-size: 30rpx;
  font-weight: 700;
  color: #FF6B9D;
}

.period-days {
  font-size: 28rpx;
  color: #FF6B9D;
  font-weight: 600;
}

.period-info {
  margin-bottom: 16rpx;
}

.period-date {
  font-size: 26rpx;
  color: #666;
}

.end-btn {
  width: 100%;
  margin-top: 8rpx;
}

.history-section {
  padding: 0 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  margin: 0 0 16rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.record-date-range {
  display: flex;
  align-items: center;
}

.record-start, .record-end {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.record-arrow {
  color: #999;
  margin: 0 8rpx;
}

.record-duration {
  background: #FFF0F5;
  color: #FF6B9D;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.record-ongoing {
  background: #FFE4EF;
  color: #FF6B9D;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.record-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.detail-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FFF5F8;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #666;
}

.tag-icon {
  font-size: 24rpx;
}

.record-symptoms {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.symptom-tag {
  background: #F3E8FF;
  color: #C084FC;
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.record-notes {
  margin-bottom: 12rpx;
}

.notes-text {
  font-size: 24rpx;
  color: #999;
  font-style: italic;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #FFF0F5;
}

.action-edit, .action-delete {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.action-edit {
  color: #60A5FA;
  background: #EFF6FF;
}

.action-delete {
  color: #F87171;
  background: #FFF5F5;
}
</style>
