<template>
  <view class="page-container">
    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-scroll">
      <view class="category-list">
        <view
          class="category-tag"
          v-for="cat in categories"
          :key="cat.id"
          :class="{ active: activeCategory === cat.id }"
          @tap="activeCategory = cat.id"
        >
          <text>{{ cat.icon }} {{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view
        class="post-card card"
        v-for="post in filteredPosts"
        :key="post.id"
        @tap="viewPost(post)"
      >
        <!-- 帖子头部 -->
        <view class="post-header">
          <view class="post-avatar" :style="{ background: post.avatarBg }">
            <text class="avatar-text">{{ post.author[0] }}</text>
          </view>
          <view class="post-author-info">
            <text class="post-author">{{ post.author }}</text>
            <text class="post-time">{{ post.time }}</text>
          </view>
          <view class="post-category-tag" :style="{ background: post.tagBg }">
            {{ post.category }}
          </view>
        </view>

        <!-- 帖子内容 -->
        <text class="post-title">{{ post.title }}</text>
        <text class="post-content">{{ post.content }}</text>

        <!-- 帖子图片 -->
        <view class="post-images" v-if="post.images && post.images.length > 0">
          <view
            class="post-image"
            v-for="(img, idx) in post.images"
            :key="idx"
            :style="{ background: img }"
          >
            <text class="img-placeholder">📷</text>
          </view>
        </view>

        <!-- 帖子操作 -->
        <view class="post-actions">
          <view class="action-btn" @tap.stop="likePost(post)">
            <text class="action-icon">{{ post.liked ? '❤️' : '🤍' }}</text>
            <text class="action-count">{{ post.likes }}</text>
          </view>
          <view class="action-btn" @tap.stop="viewPost(post)">
            <text class="action-icon">💬</text>
            <text class="action-count">{{ post.comments }}</text>
          </view>
          <view class="action-btn" @tap.stop="sharePost(post)">
            <text class="action-icon">🔗</text>
            <text class="action-count">分享</text>
          </view>
        </view>

        <!-- 热门评论预览 -->
        <view class="comment-preview" v-if="post.topComment">
          <text class="preview-author">{{ post.topComment.author }}：</text>
          <text class="preview-text">{{ post.topComment.text }}</text>
        </view>
      </view>
    </view>

    <!-- 发帖按钮 -->
    <view class="fab-btn" @tap="createPost">
      <text class="fab-icon">✏️</text>
    </view>

    <!-- 帖子详情弹窗 -->
    <view class="post-detail-modal" v-if="showDetail">
      <view class="modal-mask" @tap="showDetail = false"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">帖子详情</text>
          <text class="modal-close" @tap="showDetail = false">✕</text>
        </view>
        <scroll-view scroll-y class="modal-scroll">
          <view class="detail-post" v-if="detailPost">
            <text class="detail-title">{{ detailPost.title }}</text>
            <text class="detail-content">{{ detailPost.content }}</text>

            <view class="detail-divider"></view>

            <text class="comment-section-title">💬 评论 ({{ detailPost.comments }})</text>
            <view class="comment-list">
              <view class="comment-item" v-for="(c, idx) in detailComments" :key="idx">
                <view class="comment-avatar" :style="{ background: c.avatarBg }">
                  <text class="comment-avatar-text">{{ c.author[0] }}</text>
                </view>
                <view class="comment-body">
                  <text class="comment-author">{{ c.author }}</text>
                  <text class="comment-text">{{ c.text }}</text>
                  <text class="comment-time">{{ c.time }}</text>
                </view>
              </view>
            </view>

            <!-- 评论输入 -->
            <view class="comment-input-area">
              <input
                class="comment-input"
                v-model="newComment"
                placeholder="写评论..."
                placeholder-class="input-placeholder"
              />
              <view class="comment-send" @tap="submitComment">
                <text class="send-text">发送</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeCategory: 'all',
      showDetail: false,
      detailPost: null,
      detailComments: [],
      newComment: '',
      categories: [
        { id: 'all', name: '全部', icon: '📋' },
        { id: 'product', name: '好物分享', icon: '🛍️' },
        { id: 'pregnancy', name: '备孕交流', icon: '🤰' },
        { id: 'health', name: '健康知识', icon: '💊' },
        { id: 'pain', name: '痛经缓解', icon: '🩹' },
        { id: 'emotion', name: '情绪疏导', icon: '💆' },
        { id: 'exercise', name: '运动健身', icon: '🏃' }
      ],
      posts: [
        {
          id: 1, category: '好物分享', categoryId: 'product',
          author: '小仙女', time: '2小时前', avatarBg: '#FFE4EF', tagBg: '#FFE4EF',
          title: '这款液体卫生巾真的绝了！',
          content: '用了三年各种品牌，终于找到最舒服的了！护舒宝液体卫生巾真的超级干爽，吸收特别快，完全不会有闷热感。强烈推荐给姐妹们！',
          images: ['#FFE4EF', '#F3E8FF', '#E8F4FD'],
          likes: 128, comments: 45, liked: false,
          topComment: { author: '暖宝宝', text: '真的！我也用这款，超好用！' }
        },
        {
          id: 2, category: '备孕交流', categoryId: 'pregnancy',
          author: '准妈妈', time: '5小时前', avatarBg: '#F3E8FF', tagBg: '#F3E8FF',
          title: '备孕半年终于成功了，分享经验',
          content: '备孕半年终于测到双杠了！跟姐妹们分享一下我的经验：1. 提前3个月吃叶酸 2. 用排卵试纸监测排卵 3. 保持好心情不要有压力 4. 适当运动但不要过度。希望能帮到正在备孕的姐妹们！',
          likes: 256, comments: 89, liked: false,
          topComment: { author: '加油鸭', text: '恭喜恭喜！接好孕！' }
        },
        {
          id: 3, category: '痛经缓解', categoryId: 'pain',
          author: '暖宝宝', time: '1天前', avatarBg: '#FFF5F5', tagBg: '#FFF5F5',
          title: '痛经10年，终于找到有效方法',
          content: '从小学就开始痛经，试过无数方法。现在总结出最有效的：1. 经前一周开始喝红糖姜茶 2. 来的第一天吃布洛芬（不要忍！）3. 热水袋敷肚子 4. 做猫牛式瑜伽 5. 经期前少吃冰冷。希望对姐妹们有帮助！',
          likes: 89, comments: 34, liked: false,
          topComment: { author: '同痛相怜', text: '布洛芬真的是救星！' }
        },
        {
          id: 4, category: '健康知识', categoryId: 'health',
          author: '健康达人', time: '2天前', avatarBg: '#E8F4FD', tagBg: '#E8F4FD',
          title: '月经总是推迟？可能是这些原因',
          content: '很多姐妹月经不规律，常见的原因有：1. 压力大、焦虑 2. 熬夜、作息不规律 3. 过度减肥 4. 多囊卵巢综合征 5. 甲状腺问题。如果连续3个月以上不规律，建议去医院检查一下。',
          likes: 67, comments: 23, liked: false,
          topComment: { author: '小白', text: '我就是多囊，去医院看了好了很多' }
        },
        {
          id: 5, category: '情绪疏导', categoryId: 'emotion',
          author: '小太阳', time: '3天前', avatarBg: '#FFFBEB', tagBg: '#FFFBEB',
          title: '经前综合征怎么办？分享我的调节方法',
          content: '每次来月经前一周就开始烦躁、想哭、暴躁...后来学会了几招：1. 认识到这是激素变化，不是自己的问题 2. 做让自己开心的事 3. 适当运动释放压力 4. 跟闺蜜倾诉 5. 严重的话可以看医生。姐妹们不要硬扛！',
          likes: 156, comments: 67, liked: false,
          topComment: { author: '同感', text: '原来不只是我这样，谢谢分享！' }
        },
        {
          id: 6, category: '运动健身', categoryId: 'exercise',
          author: '瑜伽姐姐', time: '4天前', avatarBg: '#F0FDF4', tagBg: '#F0FDF4',
          title: '经期也能做的5个瑜伽动作',
          content: '经期不是不能运动！这5个动作特别适合经期做：1. 婴儿式 - 放松腹部 2. 猫牛式 - 缓解腰酸 3. 仰卧束角式 - 打开髋部 4. 坐角式前屈 - 舒缓情绪 5. 腿靠墙式 - 促进循环。每个动作保持5-10个呼吸就好。',
          likes: 45, comments: 18, liked: false,
          topComment: { author: '小白兔', text: '收藏了！今晚就试试' }
        }
      ]
    }
  },
  computed: {
    filteredPosts() {
      if (this.activeCategory === 'all') return this.posts
      return this.posts.filter(p => p.categoryId === this.activeCategory)
    }
  },
  methods: {
    viewPost(post) {
      this.detailPost = post
      this.detailComments = [
        { author: '热心网友', text: '谢谢分享，很有用！', time: '1小时前', avatarBg: '#FFE4EF' },
        { author: '健康小达人', text: '补充一点：也要注意保暖哦', time: '2小时前', avatarBg: '#F3E8FF' },
        { author: '同感姐妹', text: '我也是这样！握手', time: '3小时前', avatarBg: '#E8F4FD' }
      ]
      this.newComment = ''
      this.showDetail = true
    },
    likePost(post) {
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1
    },
    sharePost(post) {
      uni.setClipboardData({
        data: `【月经助手社区】${post.title}\n${post.content}`,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        }
      })
    },
    createPost() {
      uni.navigateTo({ url: '/pages-sub/community-post/index' })
    },
    submitComment() {
      if (!this.newComment.trim()) return
      this.detailComments.push({
        author: '我',
        text: this.newComment,
        time: '刚刚',
        avatarBg: '#FFE4EF'
      })
      if (this.detailPost) this.detailPost.comments++
      this.newComment = ''
      uni.showToast({ title: '评论成功', icon: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background: #FFF0F5;
}

.category-scroll {
  white-space: nowrap;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #FFF0F5;
}

.category-list {
  display: flex;
  gap: 16rpx;
}

.category-tag {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background: #FFF5F8;
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;

  &.active {
    background: linear-gradient(135deg, #FF6B9D, #C084FC);
    color: #FFFFFF;
    font-weight: 600;
  }

  &:active {
    transform: scale(0.97);
  }
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin: 20rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.post-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
}

.avatar-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.post-author-info {
  flex: 1;
}

.post-author {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.post-time {
  font-size: 22rpx;
  color: #999;
}

.post-category-tag {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #666;
}

.post-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.post-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.post-images {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-placeholder {
  font-size: 40rpx;
  opacity: 0.5;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 1rpx solid #FFF0F5;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;

  &:active {
    background: #FFF5F8;
    border-radius: 16rpx;
  }
}

.action-icon {
  font-size: 28rpx;
}

.action-count {
  font-size: 24rpx;
  color: #999;
}

.comment-preview {
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: #FFF5F8;
  border-radius: 12rpx;
}

.preview-author {
  font-size: 24rpx;
  color: #FF6B9D;
  font-weight: 600;
}

.preview-text {
  font-size: 24rpx;
  color: #666;
}

.fab-btn {
  position: fixed;
  right: 32rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #FF6B9D, #C084FC);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
  z-index: 10;

  &:active {
    transform: scale(0.95);
  }
}

.fab-icon {
  font-size: 40rpx;
}

/* Modal */
.post-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #FFF0F5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  padding: 8rpx;
}

.modal-scroll {
  flex: 1;
  max-height: 70vh;
}

.detail-post {
  padding: 32rpx;
}

.detail-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.detail-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  display: block;
}

.detail-divider {
  height: 1rpx;
  background: #FFF0F5;
  margin: 24rpx 0;
}

.comment-section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.comment-item {
  display: flex;
  gap: 12rpx;
}

.comment-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-avatar-text {
  font-size: 22rpx;
  color: #333;
}

.comment-body {
  flex: 1;
}

.comment-author {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.comment-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.comment-time {
  font-size: 20rpx;
  color: #CCC;
}

.comment-input-area {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid #FFF0F5;
}

.comment-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: #FFF5F8;
  border-radius: 36rpx;
  font-size: 26rpx;
}

.input-placeholder {
  color: #CCC;
}

.comment-send {
  padding: 0 24rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #FF6B9D, #C084FC);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
