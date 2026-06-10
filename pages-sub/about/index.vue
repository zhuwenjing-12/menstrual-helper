<template>
  <view class="page-container">
    <!-- Logo和名称 -->
    <view class="logo-section">
      <view class="logo">
        <text class="logo-emoji">🌸</text>
      </view>
      <text class="app-name">月经助手</text>
      <text class="app-version">v1.0.0</text>
    </view>

    <!-- 功能介绍 -->
    <view class="section card">
      <text class="section-title">功能介绍</text>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📝</text>
          <view class="feature-content">
            <text class="feature-name">快速记录</text>
            <text class="feature-desc">一键开始/结束经期，记录流量、颜色、痛感、症状等</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📅</text>
          <view class="feature-content">
            <text class="feature-name">日历视图</text>
            <text class="feature-desc">按月展示经期、排卵期、易孕期、安全期</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🔮</text>
          <view class="feature-content">
            <text class="feature-name">智能预测</text>
            <text class="feature-desc">基于历史数据自动预测下次经期和排卵日</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <view class="feature-content">
            <text class="feature-name">数据统计</text>
            <text class="feature-desc">周期分析图表，异常提醒，健康洞察</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🔒</text>
          <view class="feature-content">
            <text class="feature-name">隐私保护</text>
            <text class="feature-desc">支持密码锁，纯本地存储，数据不上传</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 隐私声明 -->
    <view class="section card">
      <text class="section-title">隐私声明</text>
      <text class="privacy-text">
        月经助手非常重视您的隐私保护。本应用：
      </text>
      <view class="privacy-list">
        <text class="privacy-item">✅ 所有数据仅存储在您的设备本地</text>
        <text class="privacy-item">✅ 不需要网络权限也能正常使用</text>
        <text class="privacy-item">✅ 不收集任何个人信息</text>
        <text class="privacy-item">✅ 不包含任何广告或追踪</text>
        <text class="privacy-item">✅ 支持密码锁保护您的隐私</text>
        <text class="privacy-item">✅ 数据可随时导出或清除</text>
      </view>
    </view>

    <!-- 使用帮助 -->
    <view class="section card">
      <text class="section-title">使用帮助</text>
      <view class="help-list">
        <view class="help-item" v-for="(item, index) in helpItems" :key="index">
          <text class="help-q">Q: {{ item.q }}</text>
          <text class="help-a">A: {{ item.a }}</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="section card">
      <text class="section-title">关于开发者</text>
      <text class="about-text">
        月经助手是一款专注于女性经期健康管理的工具，旨在为用户提供简洁、私密、准确的经期管理体验。
      </text>
      <text class="about-text">
        如果您在使用过程中遇到问题或有好的建议，欢迎反馈。
      </text>
    </view>

    <!-- 版权信息 -->
    <view class="copyright">
      <text class="copyright-text">© 2024 月经助手</text>
      <text class="copyright-sub">Made with ❤️ for women's health</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      helpItems: [
        {
          q: '如何记录经期？',
          a: '在首页点击"开始经期"按钮，经期结束后点击"结束经期"。也可以在记录页面添加详细记录。'
        },
        {
          q: '预测准确吗？',
          a: '预测基于您的历史周期数据计算平均值，记录越多越准确。建议至少记录3次以上经期。'
        },
        {
          q: '如何备份数据？',
          a: '在"我的"页面进入"数据备份"，可以导出JSON文件或复制到剪贴板进行备份。'
        },
        {
          q: '数据安全吗？',
          a: '所有数据仅存储在您的设备本地，不会上传到任何服务器。您还可以设置隐私密码保护。'
        },
        {
          q: '周期不规律怎么办？',
          a: '继续记录，系统会自动分析周期变化。如果周期波动较大，建议咨询医生。'
        }
      ]
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

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
}

.logo {
  width: 128rpx;
  height: 128rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #FFE4EF, #F3E8FF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.2);
}

.logo-emoji {
  font-size: 64rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}

.app-version {
  font-size: 26rpx;
  color: #999;
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

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.feature-icon {
  font-size: 36rpx;
  margin-top: 4rpx;
}

.feature-content {
  flex: 1;
}

.feature-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.privacy-text {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
  line-height: 1.6;
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.privacy-item {
  font-size: 26rpx;
  color: #4ADE80;
  line-height: 1.5;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.help-item {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #FFF0F5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.help-q {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.help-a {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.about-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 16rpx;
  display: block;

  &:last-child {
    margin-bottom: 0;
  }
}

.copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
}

.copyright-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.copyright-sub {
  font-size: 22rpx;
  color: #CCC;
}
</style>
