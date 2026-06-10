<template>
  <view class="page-container">
    <!-- 顶部 Banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">🌸 发现</text>
        <text class="banner-desc">探索更多女性健康话题</text>
      </view>
    </view>

    <!-- 功能入口网格 -->
    <view class="feature-grid card">
      <view class="feature-item" @tap="goToDelivery">
        <view class="feature-icon-wrap" style="background: linear-gradient(135deg, #FF6B9D, #FF8EB5);">
          <text class="feature-emoji">📦</text>
        </view>
        <text class="feature-name">姨妈巾速送</text>
        <text class="feature-desc">急需？一键下单</text>
      </view>
      <view class="feature-item" @tap="goToCommunity">
        <view class="feature-icon-wrap" style="background: linear-gradient(135deg, #C084FC, #D8B4FE);">
          <text class="feature-emoji">💬</text>
        </view>
        <text class="feature-name">女性话题</text>
        <text class="feature-desc">交流分享经验</text>
      </view>
      <view class="feature-item" @tap="goToStats">
        <view class="feature-icon-wrap" style="background: linear-gradient(135deg, #4ADE80, #86EFAC);">
          <text class="feature-emoji">📊</text>
        </view>
        <text class="feature-name">数据统计</text>
        <text class="feature-desc">周期分析报告</text>
      </view>
      <view class="feature-item" @tap="goToAI">
        <view class="feature-icon-wrap" style="background: linear-gradient(135deg, #60A5FA, #93C5FD);">
          <text class="feature-emoji">🤖</text>
        </view>
        <text class="feature-name">AI 助手</text>
        <text class="feature-desc">智能健康问答</text>
      </view>
    </view>

    <!-- 热门话题 -->
    <view class="section card">
      <view class="section-header">
        <text class="section-title">🔥 热门话题</text>
        <text class="section-more" @tap="goToCommunity">查看全部 ›</text>
      </view>
      <view class="topic-list">
        <view
          class="topic-item"
          v-for="topic in hotTopics"
          :key="topic.id"
          @tap="goToCommunityDetail(topic)"
        >
          <view class="topic-tag" :style="{ background: topic.tagColor }">
            {{ topic.tag }}
          </view>
          <view class="topic-content">
            <text class="topic-title">{{ topic.title }}</text>
            <view class="topic-meta">
              <text class="topic-author">{{ topic.author }}</text>
              <text class="topic-count">{{ topic.comments }}条评论</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 姨妈巾推荐 -->
    <view class="section card">
      <view class="section-header">
        <text class="section-title">🛍️ 姨妈巾口碑榜</text>
        <text class="section-more" @tap="goToDelivery">更多 ›</text>
      </view>
      <scroll-view scroll-x class="product-scroll">
        <view class="product-list">
          <view
            class="product-card"
            v-for="product in recommendedProducts"
            :key="product.id"
            @tap="goToDeliveryDetail(product)"
          >
            <view class="product-img" :style="{ background: product.bgColor }">
              <text class="product-emoji">{{ product.emoji }}</text>
            </view>
            <text class="product-name">{{ product.name }}</text>
            <view class="product-rating">
              <text class="rating-stars">{{ '⭐'.repeat(product.rating) }}</text>
              <text class="rating-count">{{ product.reviews }}人评</text>
            </view>
            <text class="product-price">¥{{ product.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 健康知识 -->
    <view class="section card">
      <view class="section-header">
        <text class="section-title">📚 健康知识</text>
      </view>
      <view class="knowledge-list">
        <view
          class="knowledge-item"
          v-for="item in knowledgeList"
          :key="item.id"
          @tap="showKnowledge(item)"
        >
          <text class="knowledge-icon">{{ item.icon }}</text>
          <view class="knowledge-content">
            <text class="knowledge-title">{{ item.title }}</text>
            <text class="knowledge-desc">{{ item.desc }}</text>
          </view>
          <text class="knowledge-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      hotTopics: [
        { id: 1, tag: '好物分享', tagColor: '#FFE4EF', title: '姐妹们！这款液体卫生巾真的绝了，超级干爽', author: '小仙女', comments: 128 },
        { id: 2, tag: '备孕交流', tagColor: '#F3E8FF', title: '备孕半年终于成功了，分享一下我的经验', author: '准妈妈', comments: 256 },
        { id: 3, tag: '痛经缓解', tagColor: '#FFF5F5', title: '痛经10年，终于找到了有效的缓解方法', author: '暖宝宝', comments: 89 },
        { id: 4, tag: '周期不规律', tagColor: '#EFF6FF', title: '月经总是推迟怎么办？医生给了我这些建议', author: '健康达人', comments: 67 },
        { id: 5, tag: '运动健身', tagColor: '#F0FDF4', title: '经期到底能不能运动？哪些运动适合经期做', author: '瑜伽姐姐', comments: 45 }
      ],
      recommendedProducts: [
        { id: 1, name: '护舒宝液体卫生巾', emoji: '🏆', bgColor: '#FFE4EF', rating: 5, reviews: 2345, price: '39.9' },
        { id: 2, name: '苏菲超熟睡', emoji: '🌙', bgColor: '#F3E8FF', rating: 5, reviews: 1890, price: '29.9' },
        { id: 3, name: '自由点益生菌', emoji: '🌿', bgColor: '#F0FDF4', rating: 4, reviews: 1234, price: '45.0' },
        { id: 4, name: 'ABC清凉薄荷', emoji: '❄️', bgColor: '#EFF6FF', rating: 4, reviews: 987, price: '35.5' },
        { id: 5, name: '花王乐而雅', emoji: '🌸', bgColor: '#FFF5F5', rating: 5, reviews: 3456, price: '52.0' }
      ],
      knowledgeList: [
        { id: 1, icon: '🩸', title: '经期卫生知识', desc: '了解经期卫生的基本常识', articleId: 'menstrual-health' },
        { id: 2, icon: '🥗', title: '经期饮食指南', desc: '经期该吃什么不该吃什么', articleId: 'diet-guide' },
        { id: 3, icon: '🏃‍♀️', title: '经期运动建议', desc: '经期适合做哪些运动', articleId: 'exercise-guide' },
        { id: 4, icon: '😴', title: '经期睡眠改善', desc: '如何在经期获得好睡眠', articleId: 'sleep-improve' },
        { id: 5, icon: '💊', title: '痛经缓解全攻略', desc: '痛经的多种缓解方法', articleId: 'pain-relief' },
        { id: 6, icon: '🤰', title: '备孕完全攻略', desc: '备孕期的健康管理要点', articleId: 'pregnancy-prep' }
      ]
    }
  },
  methods: {
    goToDelivery() {
      uni.navigateTo({ url: '/pages-sub/delivery/index' })
    },
    goToCommunity() {
      uni.navigateTo({ url: '/pages-sub/community/index' })
    },
    goToCommunityDetail(topic) {
      uni.navigateTo({ url: '/pages-sub/community/index?topic=' + topic.id })
    },
    goToStats() {
      uni.navigateTo({ url: '/pages-sub/stats/index' })
    },
    goToAI() {
      uni.switchTab({ url: '/pages/ai/index' })
    },
    goToDeliveryDetail(product) {
      uni.navigateTo({ url: '/pages-sub/delivery/index?product=' + product.id })
    },
    showKnowledge(item) {
      uni.navigateTo({ url: '/pages-sub/knowledge/index?id=' + item.articleId })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.banner {
  margin: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #FFE4EF, #F3E8FF, #E8F4FD);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 157, 0.12);
}

.banner-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.banner-desc {
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

.feature-grid {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20rpx;
}

.feature-item {
  width: 22%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:active {
    transform: scale(0.95);
  }
}

.feature-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.feature-emoji {
  font-size: 44rpx;
}

.feature-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
}

.feature-desc {
  font-size: 20rpx;
  color: #999;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.section-more {
  font-size: 24rpx;
  color: #FF6B9D;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.topic-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FFF5F8;
  }
}

.topic-tag {
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-meta {
  display: flex;
  gap: 20rpx;
}

.topic-author, .topic-count {
  font-size: 22rpx;
  color: #999;
}

.product-scroll {
  white-space: nowrap;
}

.product-list {
  display: flex;
  gap: 16rpx;
}

.product-card {
  width: 200rpx;
  display: inline-flex;
  flex-direction: column;
  flex-shrink: 0;

  &:active {
    transform: scale(0.97);
  }
}

.product-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.product-emoji {
  font-size: 64rpx;
}

.product-name {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 4rpx;
}

.rating-stars {
  font-size: 18rpx;
}

.rating-count {
  font-size: 20rpx;
  color: #999;
}

.product-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #FF6B9D;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
}

.knowledge-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FFF5F8;
  }
}

.knowledge-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.knowledge-content {
  flex: 1;
}

.knowledge-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.knowledge-desc {
  font-size: 24rpx;
  color: #999;
}

.knowledge-arrow {
  font-size: 32rpx;
  color: #CCC;
}
</style>
