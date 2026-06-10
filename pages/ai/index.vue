<template>
  <view class="page-container">
    <!-- 顶部 -->
    <view class="ai-header">
      <view class="ai-avatar"><text class="avatar-emoji">🤖</text></view>
      <view class="ai-info">
        <text class="ai-name">AI 健康助手</text>
        <text class="ai-status" :style="{ color: apiReady ? '#4ADE80' : '#FBBF24' }">
          {{ apiReady ? '在线 · 随时为您解答' : '未配置 · 点击 ⚙️ 配置' }}
        </text>
      </view>
      <view class="header-actions">
        <view class="action-pill" @tap="openSettings">
          <text class="pill-text">⚙️</text>
        </view>
        <view class="action-pill" @tap="clearChat">
          <text class="pill-text">清空</text>
        </view>
      </view>
    </view>

    <!-- API 配置弹窗 -->
    <view class="settings-modal" v-if="showSettings">
      <view class="modal-mask" @tap="showSettings = false"></view>
      <view class="modal-body">
        <text class="modal-title">🔑 AI 配置</text>
        <text class="modal-desc">请填入 API Key 以启用 AI 助手</text>

        <text class="field-label">API 地址</text>
        <input class="field-input" v-model="formApiUrl" placeholder="https://api.deepseek.com/chat/completions" placeholder-class="input-ph" />

        <text class="field-label">API Key</text>
        <input class="field-input" v-model="formApiKey" placeholder="sk-..." :password="!showKey" placeholder-class="input-ph" />
        <view class="toggle-key" @tap="showKey = !showKey">
          <text class="toggle-text">{{ showKey ? '隐藏' : '显示' }} Key</text>
        </view>

        <text class="field-label">模型名称</text>
        <input class="field-input" v-model="formModel" placeholder="deepseek-chat" placeholder-class="input-ph" />

        <view class="help-link" @tap="openHelp">
          <text class="help-text">❓ 如何获取 API Key？</text>
        </view>

        <view class="modal-btns">
          <button class="btn-secondary" @tap="showSettings = false">取消</button>
          <button class="btn-primary" @tap="saveSettings">保存</button>
        </view>
      </view>
    </view>

    <!-- 快捷问题 -->
    <view class="quick-questions" v-if="messages.length <= 1">
      <text class="quick-title">💡 常见问题</text>
      <view class="quick-list">
        <view class="quick-item" v-for="q in quickQuestions" :key="q" @tap="sendQuickQuestion(q)">
          <text class="quick-text">{{ q }}</text>
        </view>
      </view>
    </view>

    <!-- 聊天消息 -->
    <scroll-view scroll-y class="chat-list" :scroll-into-view="scrollToId" scroll-with-animation>
      <view v-for="(msg, index) in messages" :key="index" :id="'msg-' + index">
        <view class="message-row ai" v-if="msg.role === 'ai'">
          <view class="msg-avatar"><text class="msg-avatar-text">🤖</text></view>
          <view class="msg-bubble ai-bubble">
            <text class="msg-text" v-if="!msg.isTyping">{{ msg.content }}</text>
            <view class="typing-indicator" v-else>
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
            </view>
          </view>
        </view>
        <view class="message-row user" v-if="msg.role === 'user'">
          <view class="msg-bubble user-bubble">
            <text class="msg-text">{{ msg.content }}</text>
          </view>
        </view>
      </view>
      <view id="chat-bottom"></view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-wrap">
        <input class="chat-input" v-model="inputText" placeholder="问我任何健康问题..." placeholder-class="input-ph" @confirm="sendMessage" :disabled="isLoading" />
        <view class="send-btn" :class="{ active: inputText.trim() && !isLoading }" @tap="sendMessage">
          <text class="send-text">{{ isLoading ? '...' : '↑' }}</text>
        </view>
      </view>
      <text class="disclaimer">AI回答仅供参考，如有健康问题请咨询专业医生</text>
    </view>
  </view>
</template>

<script>
import { chatWithAI, clearHistory, isAPIConfigured, updateConfig, getFullConfig } from '../../utils/ai'

export default {
  data() {
    return {
      inputText: '',
      isLoading: false,
      scrollToId: '',
      showSettings: false,
      showKey: false,
      apiReady: false,
      formApiUrl: '',
      formApiKey: '',
      formModel: '',
      messages: [
        { role: 'ai', content: '你好！我是你的 AI 健康助手 🌸\n\n我可以帮你解答经期、备孕、妇科健康等方面的问题。有什么想问的吗？' }
      ],
      quickQuestions: [
        '痛经怎么缓解？',
        '经期可以运动吗？',
        '月经不规律怎么办？',
        '备孕需要注意什么？',
        '经期饮食有什么禁忌？',
        '如何计算排卵期？',
        '经期量少是什么原因？',
        '子宫内膜异位症是什么？'
      ]
    }
  },
  onLoad() {
    this.apiReady = isAPIConfigured()
  },
  onShow() {
    this.apiReady = isAPIConfigured()
  },
  methods: {
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.isLoading) return

      this.messages.push({ role: 'user', content: text })
      this.inputText = ''
      this.scrollToBottom()

      this.isLoading = true
      const typingIdx = this.messages.length
      this.messages.push({ role: 'ai', content: '', isTyping: true })
      this.scrollToBottom()

      try {
        const reply = await chatWithAI(text)
        this.messages[typingIdx] = { role: 'ai', content: reply }
      } catch (e) {
        this.messages[typingIdx] = { role: 'ai', content: '抱歉，暂时无法回答，请稍后再试 🌸' }
      }
      this.isLoading = false
      this.scrollToBottom()
    },
    sendQuickQuestion(q) {
      this.inputText = q
      this.sendMessage()
    },
    openSettings() {
      const cfg = getFullConfig()
      this.formApiUrl = cfg.apiUrl
      this.formApiKey = cfg.apiKey
      this.formModel = cfg.model
      this.showKey = false
      this.showSettings = true
    },
    saveSettings() {
      if (!this.formApiKey.trim()) {
        uni.showToast({ title: '请输入 API Key', icon: 'none' })
        return
      }
      updateConfig({
        apiUrl: this.formApiUrl.trim() || 'https://api.deepseek.com/chat/completions',
        apiKey: this.formApiKey.trim(),
        model: this.formModel.trim() || 'deepseek-chat'
      })
      this.apiReady = true
      this.showSettings = false
      uni.showToast({ title: '配置成功 ✅', icon: 'success' })
    },
    openHelp() {
      uni.showModal({
        title: '如何获取 API Key',
        content: '1. 访问 platform.deepseek.com\n2. 注册并登录账号\n3. 进入 API Keys 页面\n4. 创建新的 API Key\n5. 复制 Key 粘贴到上方输入框\n\n（也可以使用其他 OpenAI 兼容接口，只需修改 API 地址和模型名称）',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#FF6B9D'
      })
    },
    clearChat() {
      uni.showModal({
        title: '清空聊天', content: '确定清空所有聊天记录吗？',
        confirmColor: '#FF6B9D',
        success: (res) => {
          if (res.confirm) {
            clearHistory()
            this.messages = [
              { role: 'ai', content: '你好！我是你的 AI 健康助手 🌸\n\n我可以帮你解答经期、备孕、妇科健康等方面的问题。有什么想问的吗？' }
            ]
          }
        }
      })
    },
    scrollToBottom() {
      setTimeout(() => {
        this.scrollToId = ''
        this.$nextTick(() => { this.scrollToId = 'chat-bottom' })
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container { min-height:100vh; display:flex; flex-direction:column; background:#FFF0F5; }

.ai-header { display:flex; align-items:center; padding:20rpx 24rpx; background:#FFF; border-bottom:1rpx solid #FFF0F5; }
.ai-avatar { width:72rpx; height:72rpx; border-radius:36rpx; background:linear-gradient(135deg,#FFE4EF,#F3E8FF); display:flex; align-items:center; justify-content:center; margin-right:16rpx; }
.avatar-emoji { font-size:36rpx; }
.ai-info { flex:1; }
.ai-name { font-size:30rpx; font-weight:700; color:#333; display:block; }
.ai-status { font-size:22rpx; }
.header-actions { display:flex; gap:12rpx; }
.action-pill { padding:10rpx 20rpx; background:#FFF5F8; border-radius:20rpx; &:active{background:#FFE4EF;} }
.pill-text { font-size:24rpx; color:#999; }

.settings-modal { position:fixed; top:0; left:0; right:0; bottom:0; z-index:200; display:flex; align-items:center; justify-content:center; }
.modal-mask { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); }
.modal-body { position:relative; width:88%; background:#FFF; border-radius:24rpx; padding:36rpx; max-height:80vh; overflow-y:auto; }
.modal-title { font-size:34rpx; font-weight:700; color:#333; display:block; text-align:center; margin-bottom:8rpx; }
.modal-desc { font-size:24rpx; color:#999; display:block; text-align:center; margin-bottom:24rpx; }
.field-label { font-size:24rpx; color:#666; display:block; margin-bottom:8rpx; margin-top:16rpx; }
.field-input { width:100%; height:72rpx; padding:0 20rpx; background:#FFF5F8; border-radius:12rpx; font-size:26rpx; color:#333; box-sizing:border-box; border:2rpx solid #FFD6E7; }
.input-ph { color:#CCC; }
.toggle-key { margin-top:8rpx; }
.toggle-text { font-size:22rpx; color:#FF6B9D; }
.help-link { margin-top:16rpx; text-align:center; }
.help-text { font-size:24rpx; color:#C084FC; }
.modal-btns { display:flex; gap:16rpx; margin-top:24rpx; button{flex:1; height:80rpx; font-size:28rpx;} }

.quick-questions { padding:24rpx; }
.quick-title { font-size:26rpx; color:#666; margin-bottom:16rpx; display:block; }
.quick-list { display:flex; flex-wrap:wrap; gap:12rpx; }
.quick-item { padding:14rpx 24rpx; background:#FFF; border-radius:32rpx; border:2rpx solid #FFD6E7; &:active{background:#FFE4EF;} }
.quick-text { font-size:24rpx; color:#FF6B9D; }

.chat-list { flex:1; padding:24rpx; height:0; }
.message-row { display:flex; margin-bottom:24rpx; align-items:flex-start; &.user{justify-content:flex-end;} &.ai{justify-content:flex-start;} }
.msg-avatar { width:56rpx; height:56rpx; border-radius:28rpx; background:linear-gradient(135deg,#FFE4EF,#F3E8FF); display:flex; align-items:center; justify-content:center; margin-right:12rpx; flex-shrink:0; }
.msg-avatar-text { font-size:28rpx; }
.msg-bubble { max-width:75%; padding:20rpx 24rpx; border-radius:24rpx; word-break:break-all; white-space:pre-wrap; }
.ai-bubble { background:#FFF; border-radius:4rpx 24rpx 24rpx 24rpx; box-shadow:0 2rpx 12rpx rgba(0,0,0,0.04); }
.user-bubble { background:linear-gradient(135deg,#FF6B9D,#C084FC); border-radius:24rpx 4rpx 24rpx 24rpx; }
.msg-text { font-size:28rpx; line-height:1.7; }
.ai-bubble .msg-text { color:#333; }
.user-bubble .msg-text { color:#FFF; }
.typing-indicator { display:flex; gap:8rpx; padding:8rpx 0; }
.typing-dot { width:12rpx; height:12rpx; border-radius:6rpx; background:#CCC; animation:typing 1.4s infinite; &:nth-child(2){animation-delay:0.2s;} &:nth-child(3){animation-delay:0.4s;} }
@keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0);} 30%{opacity:1;transform:translateY(-4rpx);} }

.input-area { padding:16rpx 24rpx 32rpx; background:#FFF; border-top:1rpx solid #FFF0F5; }
.input-wrap { display:flex; align-items:center; gap:12rpx; }
.chat-input { flex:1; height:80rpx; padding:0 24rpx; background:#FFF5F8; border-radius:40rpx; font-size:28rpx; color:#333; }
.send-btn { width:72rpx; height:72rpx; border-radius:36rpx; background:#E0E0E0; display:flex; align-items:center; justify-content:center; transition:all 0.2s; &.active{background:linear-gradient(135deg,#FF6B9D,#C084FC);} }
.send-text { font-size:32rpx; font-weight:700; color:#FFF; }
.disclaimer { font-size:20rpx; color:#CCC; text-align:center; display:block; margin-top:12rpx; }
</style>
