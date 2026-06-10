<template>
  <view class="page-container">
    <!-- 分类选择 -->
    <view class="form-card card">
      <text class="form-label">选择话题分类</text>
      <view class="category-grid">
        <view
          class="cat-item"
          v-for="cat in categories"
          :key="cat.id"
          :class="{ active: selectedCategory === cat.id }"
          @tap="selectedCategory = cat.id"
        >
          <text class="cat-icon">{{ cat.icon }}</text>
          <text class="cat-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 标题 -->
    <view class="form-card card">
      <text class="form-label">标题</text>
      <view class="input-wrap">
        <input
          class="form-input"
          :value="title"
          @input="onTitleInput"
          placeholder="给帖子取个标题吧"
          placeholder-class="input-placeholder"
          :maxlength="50"
          confirm-type="next"
        />
      </view>
      <text class="char-count">{{ title.length }}/50</text>
    </view>

    <!-- 内容 -->
    <view class="form-card card">
      <text class="form-label">内容</text>
      <view class="textarea-wrap">
        <textarea
          class="form-textarea"
          :value="content"
          @input="onContentInput"
          placeholder="分享你的经验、心得或提问..."
          placeholder-class="input-placeholder"
          :maxlength="1000"
          auto-height
        />
      </view>
      <text class="char-count">{{ content.length }}/1000</text>
    </view>

    <!-- 发布按钮 -->
    <view class="submit-section">
      <button class="btn-primary submit-btn" @tap="publishPost">发布帖子</button>
      <button class="btn-secondary" @tap="goBack">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedCategory: 'product',
      title: '',
      content: '',
      categories: [
        { id: 'product', name: '好物分享', icon: '🛍️' },
        { id: 'pregnancy', name: '备孕交流', icon: '🤰' },
        { id: 'health', name: '健康知识', icon: '💊' },
        { id: 'pain', name: '痛经缓解', icon: '🩹' },
        { id: 'emotion', name: '情绪疏导', icon: '💆' },
        { id: 'exercise', name: '运动健身', icon: '🏃' }
      ]
    }
  },
  methods: {
    onTitleInput(e) {
      this.title = e.detail.value
    },
    onContentInput(e) {
      this.content = e.detail.value
    },
    publishPost() {
      if (!this.title.trim()) {
        uni.showToast({ title: '请输入标题', icon: 'none' })
        return
      }
      if (!this.content.trim()) {
        uni.showToast({ title: '请输入内容', icon: 'none' })
        return
      }
      uni.showModal({
        title: '🎉 发布成功',
        content: '您的帖子已发布，感谢分享！',
        showCancel: false,
        confirmText: '好的',
        confirmColor: '#FF6B9D',
        success: () => {
          uni.navigateBack()
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
  padding: 28rpx;
  margin: 24rpx;
  margin-bottom: 0;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: #FFF5F8;
  border-radius: 24rpx;
  border: 2rpx solid transparent;

  &.active {
    background: #FFE4EF;
    border-color: #FF6B9D;
  }

  &:active {
    transform: scale(0.97);
  }
}

.cat-icon {
  font-size: 28rpx;
}

.cat-name {
  font-size: 24rpx;
  color: #666;
}

.input-wrap {
  background: #FFF5F8;
  border-radius: 16rpx;
  padding: 4rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.textarea-wrap {
  background: #FFF5F8;
  border-radius: 16rpx;
  padding: 4rpx;
}

.form-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
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
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  font-size: 32rpx;
}

.btn-secondary {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
}
</style>
