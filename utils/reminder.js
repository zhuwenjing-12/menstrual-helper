/**
 * 经期提醒闹钟系统
 * 使用本地推送通知，确保提醒会响
 */

import { predictNextPeriod, predictOvulation } from './prediction'
import { addDays, formatDate, getToday, daysBetween } from './date'

// 提醒类型
const REMINDER_TYPES = {
  PERIOD_SOON: 'period_soon',       // 经期即将到来
  PERIOD_TODAY: 'period_today',     // 今天可能来月经
  OVULATION: 'ovulation',           // 排卵日提醒
  FERTILE: 'fertile',               // 易孕期提醒
  RECORD: 'record',                 // 每日记录提醒
  MEDICINE: 'medicine'              // 用药提醒
}

// 默认提醒设置
const DEFAULT_SETTINGS = {
  enablePeriodSoon: true,      // 经期即将到来提醒
  periodSoonDays: 2,           // 提前几天提醒
  enablePeriodToday: true,     // 经期当天提醒
  enableOvulation: true,       // 排卵日提醒
  enableFertile: false,        // 易孕期提醒
  enableDailyRecord: false,    // 每日记录提醒
  dailyRecordTime: '21:00',   // 每日记提醒时间
  enableMedicine: false,       // 用药提醒
  medicineTime: '08:00',      // 用药提醒时间
  alarmEnabled: true,          // 闹钟是否开启（响铃+振动）
  soundEnabled: true,          // 声音
  vibrateEnabled: true         // 振动
}

/**
 * 获取提醒设置
 */
export function getReminderSettings() {
  try {
    const saved = uni.getStorageSync('reminder_settings')
    if (saved) return { ...DEFAULT_SETTINGS, ...saved }
  } catch (e) {}
  return { ...DEFAULT_SETTINGS }
}

/**
 * 保存提醒设置
 */
export function saveReminderSettings(settings) {
  try {
    uni.setStorageSync('reminder_settings', settings)
  } catch (e) {}
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission() {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    if (plus.os.name === 'Android') {
      // Android 需要检查通知权限
      const main = plus.android.runtimeMainActivity()
      const NotificationManager = plus.android.importClass('android.app.NotificationManager')
      const nm = main.getSystemService('notification')
      if (nm) {
        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      // iOS
      resolve(true)
    }
    // #endif

    // #ifdef H5
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        resolve(permission === 'granted')
      })
    } else {
      resolve(true)
    }
    // #endif

    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds: [],
      success: () => resolve(true),
      fail: () => resolve(false)
    })
    // #endif
  })
}

/**
 * 发送本地通知（会响铃+振动）
 * @param {Object} options
 * @param {String} options.title - 通知标题
 * @param {String} options.content - 通知内容
 * @param {Number} options.delay - 延迟秒数（0=立即）
 * @param {Boolean} options.alarm - 是否作为闹钟（持续响铃）
 */
export function sendNotification(options) {
  const { title, content, delay = 0, alarm = false } = options

  // #ifdef APP-PLUS
  const settings = getReminderSettings()

  // 创建通知渠道（Android 8.0+）
  if (plus.os.name === 'Android') {
    const NotificationChannel = plus.android.importClass('android.app.NotificationChannel')
    const NotificationManager = plus.android.importClass('android.app.NotificationManager')
    const AudioAttributes = plus.android.importClass('android.media.AudioAttributes')
    const RingtoneManager = plus.android.importClass('android.media.RingtoneManager')
    const Uri = plus.android.importClass('android.net.Uri')

    const main = plus.android.runtimeMainActivity()
    const nm = main.getSystemService('notification')

    // 创建高优先级通知渠道（确保响铃）
    const channelId = 'period_reminder'
    const channelName = '经期提醒'
    const importance = alarm ?
      NotificationManager.IMPORTANCE_HIGH :
      NotificationManager.IMPORTANCE_DEFAULT

    const channel = new NotificationChannel(channelId, channelName, importance)
    channel.setDescription('经期到来、排卵日等重要提醒')

    if (settings.soundEnabled) {
      const soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
      channel.setSound(soundUri, null)
    }

    if (settings.vibrateEnabled) {
      channel.enableVibration(true)
      channel.setVibrationPattern([0, 500, 200, 500])
    }

    channel.enableLights(true)
    channel.setLightColor(0xFFFF6B9D)

    nm.createNotificationChannel(channel)
  }

  // 构建通知内容
  const builder = {
    cover: false,
    title: title,
    content: content,
    when: Date.now() + delay * 1000,
    channel: 'period_reminder',
    sound: settings.soundEnabled ? 'system' : 'none',
    vibrate: settings.vibrateEnabled ? true : false
  }

  if (alarm) {
    // 闹钟模式：持续振动
    builder.vibrate = true
    builder.sound = 'system'
  }

  if (delay > 0) {
    // 延迟推送
    plus.push.createMessage(content, JSON.stringify({
      title: title,
      alarm: alarm
    }), {
      ...builder,
      delay: delay
    })
  } else {
    // 立即推送
    plus.push.createMessage(content, JSON.stringify({
      title: title,
      alarm: alarm
    }), builder)
  }
  // #endif

  // #ifdef H5
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: content,
      icon: '/static/tab/home-active.png',
      vibrate: [200, 100, 200]
    })
  }
  // #endif
}

/**
 * 调度经期提醒
 * 根据预测自动设置提醒闹钟
 */
export function scheduleReminders(records, cycleSettings) {
  const settings = getReminderSettings()
  if (!settings.enablePeriodSoon && !settings.enablePeriodToday &&
      !settings.enableOvulation && !settings.enableFertile) {
    return
  }

  const today = getToday()
  const nextPeriod = predictNextPeriod(records, cycleSettings.cycleLength)
  const ovulation = predictOvulation(records, cycleSettings.cycleLength)

  // 清除旧的定时提醒（重新安排）
  // 注意：本地通知无法精确取消，通过标记避免重复
  const scheduledKey = 'reminder_scheduled_' + today
  const alreadyScheduled = uni.getStorageSync(scheduledKey)
  if (alreadyScheduled) return

  if (nextPeriod) {
    // 经期即将到来提醒
    if (settings.enablePeriodSoon) {
      const remindDate = addDays(nextPeriod.startDate, -settings.periodSoonDays)
      const daysUntil = daysBetween(today, formatDate(remindDate))
      if (daysUntil >= 0 && daysUntil <= 7) {
        const delay = daysUntil * 24 * 60 * 60 // 转换为秒
        // 设置在早上9点提醒
        const now = new Date()
        const target = new Date()
        target.setHours(9, 0, 0, 0)
        let extraDelay = (target - now) / 1000
        if (extraDelay < 0) extraDelay += 24 * 60 * 60

        sendNotification({
          title: '🌸 经期提醒',
          content: `根据您的周期记录，预计${settings.periodSoonDays}天后（${nextPeriod.startDate}）来月经，请提前做好准备哦～`,
          delay: delay * 86400 + extraDelay,
          alarm: settings.alarmEnabled
        })
      }
    }

    // 经期当天提醒
    if (settings.enablePeriodToday) {
      const daysUntilPeriod = daysBetween(today, nextPeriod.startDate)
      if (daysUntilPeriod >= 0 && daysUntilPeriod <= 3) {
        const delay = daysUntilPeriod * 24 * 60 * 60
        const now = new Date()
        const target = new Date()
        target.setHours(8, 0, 0, 0)
        let extraDelay = (target - now) / 1000
        if (extraDelay < 0) extraDelay += 24 * 60 * 60

        sendNotification({
          title: '🩸 经期可能今天到来',
          content: '今天可能是月经第一天，记得随身携带卫生巾哦～',
          delay: delay * 86400 + extraDelay,
          alarm: settings.alarmEnabled
        })
      }
    }
  }

  // 排卵日提醒
  if (settings.enableOvulation && ovulation) {
    const daysUntilOvulation = daysBetween(today, ovulation.date)
    if (daysUntilOvulation >= 0 && daysUntilOvulation <= 7) {
      const delay = daysUntilOvulation * 24 * 60 * 60
      const now = new Date()
      const target = new Date()
      target.setHours(10, 0, 0, 0)
      let extraDelay = (target - now) / 1000
      if (extraDelay < 0) extraDelay += 24 * 60 * 60

      sendNotification({
        title: '🌟 排卵日提醒',
        content: `今天（${ovulation.date}）是您的排卵日。如需备孕，请注意安排；如不需备孕，请注意避孕。`,
        delay: delay * 86400 + extraDelay,
        alarm: settings.alarmEnabled
      })
    }
  }

  // 易孕期提醒
  if (settings.enableFertile && ovulation) {
    const daysUntilFertile = daysBetween(today, ovulation.fertileStart)
    if (daysUntilFertile >= 0 && daysUntilFertile <= 7) {
      const delay = daysUntilFertile * 24 * 60 * 60
      const now = new Date()
      const target = new Date()
      target.setHours(10, 30, 0, 0)
      let extraDelay = (target - now) / 1000
      if (extraDelay < 0) extraDelay += 24 * 60 * 60

      sendNotification({
        title: '💚 易孕期开始',
        content: `今天开始进入易孕期（${ovulation.fertileStart} ~ ${ovulation.fertileEnd}），请注意。`,
        delay: delay * 86400 + extraDelay,
        alarm: false
      })
    }
  }

  // 标记今天已调度
  try {
    uni.setStorageSync(scheduledKey, true)
  } catch (e) {}
}

/**
 * 立即测试通知（确认通知能响）
 */
export function testNotification() {
  sendNotification({
    title: '🔔 测试提醒',
    content: '如果您看到这条通知并听到声音，说明提醒功能正常工作！',
    delay: 2,
    alarm: true
  })
}

/**
 * 发送每日记录提醒
 */
export function scheduleDailyRecordReminder() {
  const settings = getReminderSettings()
  if (!settings.enableDailyRecord) return

  const [hours, minutes] = settings.dailyRecordTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  let delay = (target - now) / 1000
  if (delay < 0) delay += 24 * 60 * 60

  sendNotification({
    title: '📝 今日记录',
    content: '今天身体感觉怎么样？记得记录一下哦～',
    delay: delay,
    alarm: false
  })
}

export { REMINDER_TYPES, DEFAULT_SETTINGS }
