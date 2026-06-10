/**
 * AI 健康助手 - 大模型接口
 * 支持 DeepSeek / OpenAI 兼容接口
 */

// ========== 配置 ==========
const DEFAULT_CONFIG = {
  apiUrl: 'https://api.deepseek.com/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  maxTokens: 1024,
  temperature: 0.7
}

// 运行时配置（从本地存储加载）
let config = loadConfig()

function loadConfig() {
  try {
    const saved = uni.getStorageSync('ai_config')
    if (saved && saved.apiKey) {
      return { ...DEFAULT_CONFIG, ...saved }
    }
  } catch (e) {}
  return { ...DEFAULT_CONFIG }
}

function saveConfig(newConfig) {
  config = { ...config, ...newConfig }
  try {
    uni.setStorageSync('ai_config', config)
  } catch (e) {}
}

// ========== 系统提示词 ==========
const SYSTEM_PROMPT = `你是"小助手"，一位温柔贴心的女性健康AI顾问。

你的专长领域：
1. 月经周期相关问题（周期、经期、流量、颜色等）
2. 痛经缓解方法和建议
3. 经期饮食、运动、睡眠指导
4. 备孕知识和排卵期计算
5. 妇科健康常识科普
6. 卫生用品（卫生巾、棉条、月经杯）使用指导
7. 经期情绪管理和心理调适

回答要求：
- 用温暖亲切的语气，像闺蜜聊天一样
- 基于医学常识，专业准确
- 适当使用emoji让回答更生动
- 涉及严重症状时建议就医
- 回答使用中文，条理清晰
- 不给出具体药物剂量，建议咨询医生
- 回答控制在300字以内，除非用户要求详细解释
- 只回答女性健康相关问题，其他话题礼貌引导回来`

// ========== 对话历史 ==========
let messageHistory = []

/**
 * 发送消息给 AI
 */
export async function chatWithAI(userMessage) {
  if (!config.apiKey) {
    return '请先点击右上角 ⚙️ 配置 API Key 后才能使用 AI 功能哦～\n\n获取地址：platform.deepseek.com/api_keys'
  }

  messageHistory.push({ role: 'user', content: userMessage })

  // 只保留最近10条
  if (messageHistory.length > 10) {
    messageHistory = messageHistory.slice(-10)
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messageHistory
  ]

  try {
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: config.apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.apiKey
        },
        data: {
          model: config.model,
          messages: messages,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          stream: false
        },
        timeout: 30000,
        success: (r) => resolve(r),
        fail: (err) => reject(err)
      })
    })

    if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const reply = res.data.choices[0].message.content
      messageHistory.push({ role: 'assistant', content: reply })
      return reply
    }

    // API 返回错误
    console.error('AI API error:', res.statusCode, res.data)
    if (res.statusCode === 401) {
      return 'API Key 无效，请检查配置是否正确 🔑\n\n点击右上角 ⚙️ 重新配置'
    }
    if (res.statusCode === 429) {
      return '请求太频繁啦，请稍等一会儿再试 ⏰'
    }
    return 'AI 服务暂时不可用，请稍后再试 😅\n\n错误码：' + res.statusCode
  } catch (err) {
    console.error('AI request fail:', err)
    return '网络连接失败，请检查网络后重试 🌐\n\n如果网络正常，可能是 API 地址配置有误'
  }
}

/**
 * 清除对话历史
 */
export function clearHistory() {
  messageHistory = []
}

/**
 * 是否已配置 API
 */
export function isAPIConfigured() {
  return !!(config.apiKey && config.apiKey.length > 10)
}

/**
 * 更新配置
 */
export function updateConfig(newConfig) {
  saveConfig(newConfig)
}

/**
 * 获取当前配置（脱敏）
 */
export function getConfig() {
  return {
    apiUrl: config.apiUrl,
    apiKey: config.apiKey ? config.apiKey.substring(0, 8) + '...' : '',
    model: config.model,
    hasKey: !!config.apiKey
  }
}

/**
 * 获取完整配置（内部用）
 */
export function getFullConfig() {
  return { ...config }
}
