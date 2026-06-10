<template>
  <view class="page-container">
    <!-- 月份切换 -->
    <view class="month-header">
      <view class="nav-btn" @tap="changeMonth(-1)">
        <text class="nav-icon">◀</text>
      </view>
      <view class="month-title" @tap="goToToday">
        <text class="year-text">{{ currentYear }}年</text>
        <text class="month-text">{{ currentMonth + 1 }}月</text>
      </view>
      <view class="nav-btn" @tap="changeMonth(1)">
        <text class="nav-icon">▶</text>
      </view>
    </view>

    <!-- 星期头部 -->
    <view class="week-header">
      <text class="week-item" v-for="day in weekDays" :key="day">{{ day }}</text>
    </view>

    <!-- 日历网格 -->
    <view class="calendar-grid">
      <view
        class="day-cell"
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="{
          'empty': !day.date,
          'today': day.isToday,
          'selected': day.date === selectedDate,
          'period': day.status && day.status.type === 'period',
          'predicted': day.status && day.status.type === 'predicted-period',
          'ovulation': day.status && day.status.type === 'ovulation',
          'fertile': day.status && day.status.type === 'fertile',
          'other-month': day.isOtherMonth
        }"
        @tap="selectDate(day)"
      >
        <text class="day-number" v-if="day.date">{{ day.day }}</text>
        <view class="day-dot" v-if="day.status && day.status.type !== 'safe'" :style="{ background: day.status.color }"></view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="legend card">
      <view class="legend-item">
        <view class="legend-dot" style="background: #FF6B9D;"></view>
        <text class="legend-text">经期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot" style="background: #FFB3CC;"></view>
        <text class="legend-text">预测经期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot" style="background: #FBBF24;"></view>
        <text class="legend-text">排卵日</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot" style="background: #4ADE80;"></view>
        <text class="legend-text">易孕期</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot" style="background: #60A5FA;"></view>
        <text class="legend-text">安全期</text>
      </view>
    </view>

    <!-- 选中日期详情 -->
    <view class="detail-card card" v-if="selectedDateDetail">
      <view class="detail-header">
        <text class="detail-date">{{ selectedDateDetail.dateText }}</text>
        <view class="detail-status" :style="{ background: selectedDateDetail.status.color + '20', color: selectedDateDetail.status.color }">
          {{ selectedDateDetail.status.label }}
        </view>
      </view>

      <view class="detail-body" v-if="selectedDateDetail.record">
        <view class="detail-row">
          <text class="detail-label">流量</text>
          <text class="detail-value">{{ flowText(selectedDateDetail.record.flow) }}</text>
        </view>
        <view class="detail-row" v-if="selectedDateDetail.record.pain > 0">
          <text class="detail-label">痛感</text>
          <text class="detail-value">{{ painText(selectedDateDetail.record.pain) }}</text>
        </view>
        <view class="detail-row" v-if="selectedDateDetail.record.mood">
          <text class="detail-label">情绪</text>
          <text class="detail-value">{{ selectedDateDetail.record.mood }}</text>
        </view>
        <view class="detail-row" v-if="selectedDateDetail.record.symptoms && selectedDateDetail.record.symptoms.length > 0">
          <text class="detail-label">症状</text>
          <text class="detail-value">{{ selectedDateDetail.record.symptoms.join('、') }}</text>
        </view>
        <view class="detail-row" v-if="selectedDateDetail.record.notes">
          <text class="detail-label">备注</text>
          <text class="detail-value">{{ selectedDateDetail.record.notes }}</text>
        </view>
      </view>

      <view class="detail-body" v-else>
        <text class="detail-hint">暂无记录，点击下方按钮添加</text>
        <button class="btn-secondary" @tap="addRecordForDate" style="margin-top: 16rpx;">添加记录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate, getToday, getDaysInMonth, getFirstDayOfMonth, isSameDay, daysBetween } from '../../utils/date'
import { getDateStatus, calcAverageCycle } from '../../utils/prediction'
import store from '../../store'

export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDate: getToday(),
      records: [],
      settings: {},
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    calendarDays() {
      const days = []
      const daysInMonth = getDaysInMonth(this.currentYear, this.currentMonth)
      const firstDay = getFirstDayOfMonth(this.currentYear, this.currentMonth)
      const today = getToday()

      // 上个月的补充日期
      const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1
      const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear
      const prevDays = getDaysInMonth(prevYear, prevMonth)
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevDays - i
        const date = formatDate(new Date(prevYear, prevMonth, day))
        days.push({
          date,
          day,
          isToday: date === today,
          isOtherMonth: true,
          status: getDateStatus(date, this.records, this.settings)
        })
      }

      // 当月日期
      for (let i = 1; i <= daysInMonth; i++) {
        const date = formatDate(new Date(this.currentYear, this.currentMonth, i))
        days.push({
          date,
          day: i,
          isToday: date === today,
          isOtherMonth: false,
          status: getDateStatus(date, this.records, this.settings)
        })
      }

      // 下个月的补充日期
      const remaining = 42 - days.length
      const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1
      const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear
      for (let i = 1; i <= remaining; i++) {
        const date = formatDate(new Date(nextYear, nextMonth, i))
        days.push({
          date,
          day: i,
          isToday: date === today,
          isOtherMonth: true,
          status: getDateStatus(date, this.records, this.settings)
        })
      }

      return days
    },
    selectedDateDetail() {
      if (!this.selectedDate) return null
      const d = new Date(this.selectedDate)
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const dateText = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`

      // 查找该日期的记录
      const record = this.records.find(r => {
        const start = r.startDate
        const end = r.endDate || r.startDate
        return this.selectedDate >= start && this.selectedDate <= end
      })

      const status = getDateStatus(this.selectedDate, this.records, this.settings)

      return {
        dateText,
        record,
        status
      }
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.records = store.records || []
      this.settings = store.settings || {}
    },
    changeMonth(delta) {
      let newMonth = this.currentMonth + delta
      let newYear = this.currentYear
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      } else if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
      this.currentMonth = newMonth
      this.currentYear = newYear
    },
    goToToday() {
      const today = new Date()
      this.currentYear = today.getFullYear()
      this.currentMonth = today.getMonth()
      this.selectedDate = getToday()
    },
    selectDate(day) {
      if (day.date) {
        this.selectedDate = day.date
      }
    },
    addRecordForDate() {
      uni.navigateTo({
        url: '/pages-sub/record-add/index?date=' + this.selectedDate
      })
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

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin: 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background: #FFF5F8;

  &:active {
    background: #FFE4EF;
  }
}

.nav-icon {
  font-size: 28rpx;
  color: #FF6B9D;
}

.month-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.year-text {
  font-size: 24rpx;
  color: #999;
}

.month-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

.week-header {
  display: flex;
  padding: 16rpx 24rpx;
  margin: 0 24rpx;
}

.week-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  font-weight: 600;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 8rpx 24rpx;
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.day-cell {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  &.empty {
    visibility: hidden;
  }

  &.other-month {
    opacity: 0.3;
  }

  &.today .day-number {
    background: #FF6B9D;
    color: #FFFFFF;
    border-radius: 50%;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.selected {
    background: #FFF0F5;
    border-radius: 16rpx;
  }

  &.period {
    background: #FFE4EF;
    border-radius: 16rpx;
  }

  &.predicted {
    background: #FFF5F8;
    border-radius: 16rpx;
  }

  &.ovulation {
    background: #FFFBEB;
    border-radius: 16rpx;
  }

  &.fertile {
    background: #F0FDF4;
    border-radius: 16rpx;
  }
}

.day-number {
  font-size: 28rpx;
  color: #333;
}

.day-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 4rpx;
  margin-top: 4rpx;
}

.legend {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16rpx;
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

.detail-card {
  margin-top: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-date {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.detail-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.detail-body {
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #FFF0F5;

    &:last-child {
      border-bottom: none;
    }
  }

  .detail-label {
    font-size: 26rpx;
    color: #999;
  }

  .detail-value {
    font-size: 26rpx;
    color: #333;
  }

  .detail-hint {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    display: block;
    padding: 20rpx 0;
  }
}
</style>
