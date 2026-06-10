<template>
  <view class="page-container">
    <!-- 锁屏界面 -->
    <view class="lock-section" v-if="isLocked">
      <view class="lock-icon">
        <text class="icon-emoji">🔒</text>
      </view>
      <text class="lock-title">月经助手</text>
      <text class="lock-hint">请输入密码解锁</text>

      <!-- 密码输入 -->
      <view class="password-dots">
        <view
          class="dot"
          v-for="i in 4"
          :key="i"
          :class="{ filled: password.length >= i }"
        ></view>
      </view>

      <!-- 数字键盘 -->
      <view class="number-pad">
        <view
          class="number-btn"
          v-for="num in numbers"
          :key="num"
          @tap="inputPassword(num)"
        >
          <text class="number-text">{{ num }}</text>
        </view>
        <view class="number-btn empty"></view>
        <view class="number-btn" @tap="inputPassword('0')">
          <text class="number-text">0</text>
        </view>
        <view class="number-btn" @tap="deletePassword">
          <text class="number-text">⌫</text>
        </view>
      </view>
    </view>

    <!-- 设置界面 -->
    <view class="settings-section" v-else>
      <view class="section card">
        <text class="section-title">隐私密码</text>
        <text class="section-desc">设置4位数字密码，保护您的隐私数据。</text>

        <view class="status-row">
          <text class="status-label">密码状态</text>
          <text class="status-value" :style="{ color: hasPassword ? '#4ADE80' : '#999' }">
            {{ hasPassword ? '已设置' : '未设置' }}
          </text>
        </view>

        <view class="btn-group">
          <button class="btn-primary" v-if="!hasPassword" @tap="startSetPassword">
            设置密码
          </button>
          <button class="btn-secondary" v-if="hasPassword" @tap="startChangePassword">
            修改密码
          </button>
          <button class="delete-btn" v-if="hasPassword" @tap="removePassword">
            取消密码
          </button>
        </view>
      </view>

      <!-- 设置密码弹窗 -->
      <view class="modal" v-if="showSetModal">
        <view class="modal-mask" @tap="closeModal"></view>
        <view class="modal-content">
          <text class="modal-title">{{ modalTitle }}</text>
          <text class="modal-hint">{{ modalHint }}</text>

          <view class="password-dots">
            <view
              class="dot"
              v-for="i in 4"
              :key="i"
              :class="{ filled: newPassword.length >= i }"
            ></view>
          </view>

          <!-- 数字键盘 -->
          <view class="number-pad">
            <view
              class="number-btn"
              v-for="num in numbers"
              :key="num"
              @tap="inputNewPassword(num)"
            >
              <text class="number-text">{{ num }}</text>
            </view>
            <view class="number-btn empty"></view>
            <view class="number-btn" @tap="inputNewPassword('0')">
              <text class="number-text">0</text>
            </view>
            <view class="number-btn" @tap="deleteNewPassword">
              <text class="number-text">⌫</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStorage, setStorage, removeStorage, STORAGE_KEYS } from '../../utils/storage'

export default {
  data() {
    return {
      isLocked: false,
      hasPassword: false,
      password: '',
      correctPassword: '',
      numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      showSetModal: false,
      newPassword: '',
      confirmPassword: '',
      isConfirming: false,
      modalTitle: '设置密码',
      modalHint: '请输入4位数字密码'
    }
  },
  onLoad() {
    this.correctPassword = getStorage(STORAGE_KEYS.LOCK_PASSWORD, '')
    this.hasPassword = !!this.correctPassword

    // 如果是从启动时跳转过来的，显示锁屏
    const pages = getCurrentPages()
    if (pages.length === 1 && this.hasPassword) {
      this.isLocked = true
    }
  },
  methods: {
    // 锁屏密码输入
    inputPassword(num) {
      if (this.password.length >= 4) return
      this.password += num
      if (this.password.length === 4) {
        this.checkPassword()
      }
    },
    deletePassword() {
      this.password = this.password.slice(0, -1)
    },
    checkPassword() {
      if (this.password === this.correctPassword) {
        // 密码正确，进入应用
        uni.reLaunch({ url: '/pages/index/index' })
      } else {
        uni.showToast({ title: '密码错误', icon: 'none' })
        // 震动反馈
        uni.vibrateShort()
        setTimeout(() => {
          this.password = ''
        }, 300)
      }
    },

    // 设置密码
    startSetPassword() {
      this.newPassword = ''
      this.isConfirming = false
      this.modalTitle = '设置密码'
      this.modalHint = '请输入4位数字密码'
      this.showSetModal = true
    },
    startChangePassword() {
      this.newPassword = ''
      this.isConfirming = false
      this.modalTitle = '修改密码'
      this.modalHint = '请输入新的4位数字密码'
      this.showSetModal = true
    },
    inputNewPassword(num) {
      if (this.newPassword.length >= 4) return
      this.newPassword += num
      if (this.newPassword.length === 4) {
        if (!this.isConfirming) {
          // 第一次输入，进入确认
          this.isConfirming = true
          this.confirmPassword = this.newPassword
          this.newPassword = ''
          this.modalHint = '请再次输入密码确认'
        } else {
          // 第二次输入，验证
          if (this.newPassword === this.confirmPassword) {
            setStorage(STORAGE_KEYS.LOCK_PASSWORD, this.newPassword)
            this.correctPassword = this.newPassword
            this.hasPassword = true
            this.showSetModal = false
            uni.showToast({ title: '密码设置成功', icon: 'success' })
          } else {
            uni.showToast({ title: '两次密码不一致', icon: 'none' })
            uni.vibrateShort()
            this.isConfirming = false
            this.newPassword = ''
            this.modalHint = '请输入4位数字密码'
          }
        }
      }
    },
    deleteNewPassword() {
      this.newPassword = this.newPassword.slice(0, -1)
    },
    closeModal() {
      this.showSetModal = false
    },
    removePassword() {
      uni.showModal({
        title: '确认取消',
        content: '取消密码后，应用将不再需要密码解锁。',
        confirmColor: '#FF6B9D',
        success: (res) => {
          if (res.confirm) {
            removeStorage(STORAGE_KEYS.LOCK_PASSWORD)
            this.correctPassword = ''
            this.hasPassword = false
            uni.showToast({ title: '密码已取消', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #FFF0F5;
}

/* 锁屏界面 */
.lock-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFE4EF, #FFF0F5);
}

.lock-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.2);
}

.icon-emoji {
  font-size: 56rpx;
}

.lock-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
}

.lock-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 48rpx;
}

.password-dots {
  display: flex;
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  border: 3rpx solid #FFB3CC;
  transition: all 0.2s;

  &.filled {
    background: #FF6B9D;
    border-color: #FF6B9D;
  }
}

.number-pad {
  display: flex;
  flex-wrap: wrap;
  width: 480rpx;
  justify-content: space-between;
  gap: 20rpx;
}

.number-btn {
  width: 140rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border-radius: 70rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &:active {
    background: #FFF0F5;
    transform: scale(0.95);
  }

  &.empty {
    background: transparent;
    box-shadow: none;
  }
}

.number-text {
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
}

/* 设置界面 */
.settings-section {
  min-height: 100vh;
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
  margin-bottom: 12rpx;
  display: block;
}

.section-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 24rpx;
  display: block;
  line-height: 1.6;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #FFF0F5;
  margin-bottom: 24rpx;
}

.status-label {
  font-size: 28rpx;
  color: #333;
}

.status-value {
  font-size: 28rpx;
  font-weight: 600;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn-primary, .btn-secondary {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
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

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
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
  position: relative;
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 48rpx 32rpx;
  padding-bottom: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
}

.modal-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}
</style>
