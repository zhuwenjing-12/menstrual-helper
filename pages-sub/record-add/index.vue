<template>
  <view class="page-container">
    <!-- 日期选择 -->
    <view class="form-card card">
      <text class="form-label">经期开始日期 *</text>
      <picker mode="date" :value="form.startDate" @change="onStartDateChange">
        <view class="date-picker">
          <text class="picker-text">{{ form.startDate || '请选择日期' }}</text>
          <text class="picker-icon">📅</text>
        </view>
      </picker>
    </view>

    <view class="form-card card">
      <text class="form-label">经期结束日期</text>
      <picker mode="date" :value="form.endDate" @change="onEndDateChange">
        <view class="date-picker">
          <text class="picker-text">{{ form.endDate || '未结束' }}</text>
          <text class="picker-icon">📅</text>
        </view>
      </picker>
    </view>

    <!-- 流量选择 -->
    <view class="form-card card">
      <text class="form-label">经血流量</text>
      <view class="flow-options">
        <view
          class="flow-option"
          :class="{ active: form.flow === 'light' }"
          @tap="form.flow = 'light'"
        >
          <text class="flow-icon">💧</text>
          <text class="flow-text">少量</text>
        </view>
        <view
          class="flow-option"
          :class="{ active: form.flow === 'medium' }"
          @tap="form.flow = 'medium'"
        >
          <text class="flow-icon">💧💧</text>
          <text class="flow-text">中等</text>
        </view>
        <view
          class="flow-option"
          :class="{ active: form.flow === 'heavy' }"
          @tap="form.flow = 'heavy'"
        >
          <text class="flow-icon">💧💧💧</text>
          <text class="flow-text">大量</text>
        </view>
      </view>
    </view>

    <!-- 颜色选择 -->
    <view class="form-card card">
      <text class="form-label">经血颜色</text>
      <view class="color-options">
        <view
          class="color-option"
          v-for="color in colorOptions"
          :key="color.value"
          :class="{ active: form.color === color.value }"
          @tap="form.color = color.value"
        >
          <view class="color-dot" :style="{ background: color.hex }"></view>
          <text class="color-text">{{ color.label }}</text>
        </view>
      </view>
    </view>

    <!-- 痛感选择 -->
    <view class="form-card card">
      <text class="form-label">痛感程度</text>
      <view class="pain-options">
        <view
          class="pain-option"
          v-for="(level, index) in painLevels"
          :key="index"
          :class="{ active: form.pain === index }"
          @tap="form.pain = index"
        >
          <text class="pain-emoji">{{ level.emoji }}</text>
          <text class="pain-text">{{ level.text }}</text>
        </view>
      </view>
    </view>

    <!-- 情绪选择 -->
    <view class="form-card card">
      <text class="form-label">今日情绪</text>
      <view class="mood-options">
        <view
          class="mood-option"
          v-for="mood in moodOptions"
          :key="mood"
          :class="{ active: form.mood === mood }"
          @tap="form.mood = mood"
        >
          <text class="mood-text">{{ mood }}</text>
        </view>
      </view>
    </view>

    <!-- 症状选择 -->
    <view class="form-card card">
      <text class="form-label">伴随症状</text>
      <view class="symptom-options">
        <view
          class="symptom-option"
          v-for="symptom in symptomOptions"
          :key="symptom"
          :class="{ active: form.symptoms.includes(symptom) }"
          @tap="toggleSymptom(symptom)"
        >
          <text class="symptom-text">{{ symptom }}</text>
        </view>
      </view>
    </view>

    <!-- 用药记录 -->
    <view class="form-card card">
      <text class="form-label">用药记录</text>
      <input
        class="form-input"
        v-model="form.medication"
        placeholder="如：布洛芬、益母草等"
        placeholder-class="input-placeholder"
      />
    </view>

    <!-- 备注 -->
    <view class="form-card card">
      <text class="form-label">备注</text>
      <textarea
        class="form-textarea"
        v-model="form.notes"
        placeholder="记录其他信息..."
        placeholder-class="input-placeholder"
        :maxlength="200"
      />
      <text class="char-count">{{ form.notes.length }}/200</text>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="btn-primary submit-btn" @tap="submitRecord">
        {{ isEdit ? '保存修改' : '保存记录' }}
      </button>
      <button class="btn-secondary cancel-btn" @tap="goBack">取消</button>
      <button class="delete-btn" v-if="isEdit" @tap="deleteRecord">删除记录</button>
    </view>
  </view>
</template>

<script>
import { getToday, formatDate } from '../../utils/date'
import store from '../../store'

export default {
  data() {
    return {
      isEdit: false,
      recordId: '',
      form: {
        startDate: getToday(),
        endDate: '',
        flow: 'medium',
        color: '',
        pain: 0,
        mood: '',
        symptoms: [],
        medication: '',
        notes: ''
      },
      colorOptions: [
        { value: 'bright-red', label: '鲜红', hex: '#FF4444' },
        { value: 'dark-red', label: '暗红', hex: '#8B0000' },
        { value: 'brown', label: '褐色', hex: '#8B4513' },
        { value: 'pink', label: '粉色', hex: '#FFB6C1' },
        { value: 'orange', label: '橙色', hex: '#FF8C00' }
      ],
      painLevels: [
        { emoji: '😊', text: '无痛' },
        { emoji: '😐', text: '轻微' },
        { emoji: '😣', text: '中等' },
        { emoji: '😖', text: '明显' },
        { emoji: '😭', text: '严重' },
        { emoji: '🤯', text: '剧烈' }
      ],
      moodOptions: ['开心', '平静', '焦虑', '烦躁', '低落', '易怒', '敏感', '疲惫'],
      symptomOptions: [
        '腰酸', '腹胀', '头痛', '乳房胀痛', '疲劳',
        '失眠', '食欲增加', '恶心', '腹泻', '长痘',
        '水肿', '怕冷'
      ]
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.recordId = options.id
      this.loadRecord(options.id)
    }
    if (options.date) {
      this.form.startDate = options.date
    }
  },
  methods: {
    loadRecord(id) {
      const record = store.records.find(r => r.id === id)
      if (record) {
        this.form = {
          startDate: record.startDate,
          endDate: record.endDate || '',
          flow: record.flow || 'medium',
          color: record.color || '',
          pain: record.pain || 0,
          mood: record.mood || '',
          symptoms: record.symptoms ? [...record.symptoms] : [],
          medication: record.medication || '',
          notes: record.notes || ''
        }
      }
    },
    onStartDateChange(e) {
      this.form.startDate = e.detail.value
    },
    onEndDateChange(e) {
      this.form.endDate = e.detail.value
    },
    toggleSymptom(symptom) {
      const index = this.form.symptoms.indexOf(symptom)
      if (index === -1) {
        this.form.symptoms.push(symptom)
      } else {
        this.form.symptoms.splice(index, 1)
      }
    },
    submitRecord() {
      if (!this.form.startDate) {
        uni.showToast({ title: '请选择开始日期', icon: 'none' })
        return
      }

      if (this.form.endDate && this.form.endDate < this.form.startDate) {
        uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
        return
      }

      const recordData = {
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        flow: this.form.flow,
        color: this.form.color,
        pain: this.form.pain,
        mood: this.form.mood,
        symptoms: this.form.symptoms,
        medication: this.form.medication,
        notes: this.form.notes
      }

      if (this.isEdit) {
        store.updateRecord(this.recordId, recordData)
        uni.showToast({ title: '修改成功', icon: 'success' })
      } else {
        store.addRecord(recordData)
        uni.showToast({ title: '记录成功', icon: 'success' })
      }

      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    },
    deleteRecord() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        confirmColor: '#FF6B9D',
        success: (res) => {
          if (res.confirm) {
            store.deleteRecord(this.recordId)
            uni.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 500)
          }
        }
      })
    },
    goBack() {
      uni.navigateBack()
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
  margin-bottom: 0;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-icon {
  font-size: 32rpx;
}

.flow-options, .color-options, .pain-options, .mood-options, .symptom-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.flow-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  min-width: 0;

  &.active {
    background: #FFE4EF;
    border-color: #FF6B9D;
  }
}

.flow-icon {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.flow-text {
  font-size: 24rpx;
  color: #666;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 20rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
  border: 2rpx solid transparent;

  &.active {
    background: #FFE4EF;
    border-color: #FF6B9D;
  }
}

.color-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
}

.color-text {
  font-size: 24rpx;
  color: #666;
}

.pain-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  min-width: 90rpx;

  &.active {
    background: #FFE4EF;
    border-color: #FF6B9D;
  }
}

.pain-emoji {
  font-size: 32rpx;
  margin-bottom: 4rpx;
}

.pain-text {
  font-size: 20rpx;
  color: #666;
}

.mood-option {
  padding: 16rpx 24rpx;
  background: #FFF5F8;
  border-radius: 20rpx;
  border: 2rpx solid transparent;

  &.active {
    background: #F3E8FF;
    border-color: #C084FC;
  }
}

.mood-text {
  font-size: 26rpx;
  color: #666;
}

.symptom-option {
  padding: 14rpx 22rpx;
  background: #FFF5F8;
  border-radius: 20rpx;
  border: 2rpx solid transparent;

  &.active {
    background: #FFF0F5;
    border-color: #FFB3CC;
  }
}

.symptom-text {
  font-size: 24rpx;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 20rpx;
  background: #FFF5F8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  height: 160rpx;
  box-sizing: border-box;
}

.input-placeholder {
  color: #CCC;
}

.char-count {
  font-size: 22rpx;
  color: #CCC;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.submit-section {
  padding: 32rpx 24rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  font-size: 32rpx;
  margin-bottom: 16rpx;
}

.cancel-btn {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
  margin-bottom: 16rpx;
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
