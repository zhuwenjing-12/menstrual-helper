<script>
export default {
  onLaunch() {
    console.log('月经助手启动')
    // 检查是否设置了隐私密码
    this.checkLockStatus()
  },
  onShow() {},
  onHide() {},
  methods: {
    checkLockStatus() {
      const lockPassword = uni.getStorageSync('lock_password')
      if (lockPassword) {
        // 如果设置了密码，显示解锁页面
        uni.reLaunch({ url: '/pages-sub/lock/index' })
      }
    }
  }
}
</script>

<style lang="scss">
@import './uni.scss';

/* 全局样式 */
page {
  background-color: #FFF0F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 全局卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.08);
}

/* 全局按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #FF6B9D, #C084FC);
  color: #FFFFFF;
  border: none;
  border-radius: 48rpx;
  padding: 24rpx 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
  &::after {
    border: none;
  }
}

.btn-secondary {
  background: #FFF0F5;
  color: #FF6B9D;
  border: 2rpx solid #FFD6E7;
  border-radius: 48rpx;
  padding: 24rpx 48rpx;
  font-size: 30rpx;
  text-align: center;
  &::after {
    border: none;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  page {
    background-color: #1A1A2E;
    color: #E0E0E0;
  }
  .card {
    background: #16213E;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  }
}
</style>
