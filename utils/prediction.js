/**
 * 经期预测算法
 * 基于历史周期数据的平均值算法
 */

import { formatDate, addDays, daysBetween, getToday } from './date'

/**
 * 计算平均周期长度
 * @param {Array} records - 经期记录列表
 * @returns {Number} 平均周期天数
 */
export function calcAverageCycle(records) {
  if (!records || records.length < 2) return 28

  const sorted = records
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const cycles = []
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1].startDate, sorted[i].startDate)
    // 合理范围：15-60天
    if (diff >= 15 && diff <= 60) {
      cycles.push(diff)
    }
  }

  if (cycles.length === 0) return 28
  return Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length)
}

/**
 * 计算平均经期天数
 * @param {Array} records - 经期记录列表
 * @returns {Number} 平均经期天数
 */
export function calcAveragePeriod(records) {
  if (!records || records.length === 0) return 5

  const periods = records
    .filter(r => r.endDate)
    .map(r => {
      const days = daysBetween(r.startDate, r.endDate) + 1
      return days >= 1 && days <= 15 ? days : null
    })
    .filter(Boolean)

  if (periods.length === 0) return 5
  return Math.round(periods.reduce((a, b) => a + b, 0) / periods.length)
}

/**
 * 预测下次经期开始日期
 * @param {Array} records - 经期记录列表
 * @param {Number} cycleLength - 可选，指定周期长度
 * @returns {Object} { startDate, endDate, confidence }
 */
export function predictNextPeriod(records, cycleLength) {
  if (!records || records.length === 0) {
    return null
  }

  const sorted = records
    .slice()
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  const lastRecord = sorted[0]
  const avgCycle = cycleLength || calcAverageCycle(records)
  const avgPeriod = calcAveragePeriod(records)

  const lastStart = new Date(lastRecord.startDate)
  const predictedStart = addDays(lastStart, avgCycle)
  const predictedEnd = addDays(predictedStart, avgPeriod - 1)

  // 计算置信度
  let confidence = 'medium'
  if (records.length >= 6) {
    const cycles = []
    for (let i = 1; i < sorted.length; i++) {
      const diff = daysBetween(sorted[i].startDate, sorted[i - 1].startDate)
      if (diff >= 15 && diff <= 60) cycles.push(diff)
    }
    if (cycles.length >= 3) {
      const variance =
        cycles.reduce((sum, c) => sum + Math.pow(c - avgCycle, 2), 0) /
        cycles.length
      const stdDev = Math.sqrt(variance)
      if (stdDev <= 2) confidence = 'high'
      else if (stdDev <= 5) confidence = 'medium'
      else confidence = 'low'
    }
  }

  return {
    startDate: formatDate(predictedStart),
    endDate: formatDate(predictedEnd),
    cycleLength: avgCycle,
    periodLength: avgPeriod,
    confidence,
    daysUntil: daysBetween(getToday(), formatDate(predictedStart))
  }
}

/**
 * 预测排卵日
 * 排卵日 = 下次经期前14天
 * @param {Array} records
 * @param {Number} cycleLength
 * @returns {Object}
 */
export function predictOvulation(records, cycleLength) {
  const nextPeriod = predictNextPeriod(records, cycleLength)
  if (!nextPeriod) return null

  const ovulationDate = addDays(nextPeriod.startDate, -14)
  const fertileStart = addDays(ovulationDate, -5)
  const fertileEnd = addDays(ovulationDate, 1)

  return {
    date: formatDate(ovulationDate),
    fertileStart: formatDate(fertileStart),
    fertileEnd: formatDate(fertileEnd),
    daysUntil: daysBetween(getToday(), formatDate(ovulationDate))
  }
}

/**
 * 获取指定日期的状态
 * @param {Date|String} date
 * @param {Array} records
 * @param {Object} settings
 * @returns {Object} { type, label, color }
 */
export function getDateStatus(date, records, settings) {
  const dateStr = typeof date === 'string' ? date : formatDate(date)
  const sorted = records
    .slice()
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  // 检查是否在已记录的经期中
  for (const record of records) {
    const start = record.startDate
    const end = record.endDate || record.startDate
    if (dateStr >= start && dateStr <= end) {
      return { type: 'period', label: '经期', color: '#FF6B9D' }
    }
  }

  // 检查预测的经期
  if (sorted.length > 0) {
    const avgCycle = settings?.cycleLength || calcAverageCycle(records)
    const avgPeriod = settings?.periodLength || calcAveragePeriod(records)
    const lastRecord = sorted[0]

    // 预测未来3个月
    for (let m = 1; m <= 3; m++) {
      const predictedStart = addDays(lastRecord.startDate, avgCycle * m)
      const predictedEnd = addDays(predictedStart, avgPeriod - 1)
      const pStart = formatDate(predictedStart)
      const pEnd = formatDate(predictedEnd)

      if (dateStr >= pStart && dateStr <= pEnd) {
        return { type: 'predicted-period', label: '预测经期', color: '#FFB3CC' }
      }

      // 排卵日
      const ovulationDate = formatDate(addDays(predictedStart, -14))
      if (dateStr === ovulationDate) {
        return { type: 'ovulation', label: '排卵日', color: '#FBBF24' }
      }

      // 易孕期
      const fertileStart = formatDate(addDays(predictedStart, -19))
      const fertileEnd = formatDate(addDays(predictedStart, -13))
      if (dateStr >= fertileStart && dateStr <= fertileEnd) {
        return { type: 'fertile', label: '易孕期', color: '#4ADE80' }
      }
    }
  }

  return { type: 'safe', label: '安全期', color: '#60A5FA' }
}

/**
 * 检测周期异常
 * @param {Array} records
 * @returns {Array} 异常提示列表
 */
export function detectAnomalies(records) {
  if (records.length < 3) return []

  const anomalies = []
  const sorted = records
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const avgCycle = calcAverageCycle(records)

  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1].startDate, sorted[i].startDate)

    if (diff > avgCycle + 7) {
      anomalies.push({
        type: 'late',
        message: `${formatDate(sorted[i].startDate)} 周期偏长（${diff}天）`,
        date: sorted[i].startDate
      })
    } else if (diff < avgCycle - 7) {
      anomalies.push({
        type: 'short',
        message: `${formatDate(sorted[i].startDate)} 周期偏短（${diff}天）`,
        date: sorted[i].startDate
      })
    }
  }

  // 检查经期天数异常
  for (const record of sorted) {
    if (record.endDate) {
      const periodDays = daysBetween(record.startDate, record.endDate) + 1
      if (periodDays > 10) {
        anomalies.push({
          type: 'long-period',
          message: `${formatDate(record.startDate)} 经期过长（${periodDays}天）`,
          date: record.startDate
        })
      } else if (periodDays < 2) {
        anomalies.push({
          type: 'short-period',
          message: `${formatDate(record.startDate)} 经期过短（${periodDays}天）`,
          date: record.startDate
        })
      }
    }
  }

  return anomalies
}

/**
 * 计算周期稳定性评分（0-100）
 * @param {Array} records
 * @returns {Number}
 */
export function calcStabilityScore(records) {
  if (records.length < 3) return 0

  const sorted = records
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  const cycles = []
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1].startDate, sorted[i].startDate)
    if (diff >= 15 && diff <= 60) cycles.push(diff)
  }

  if (cycles.length < 2) return 0

  const avg = cycles.reduce((a, b) => a + b, 0) / cycles.length
  const variance =
    cycles.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / cycles.length
  const stdDev = Math.sqrt(variance)

  // 标准差越小，稳定性越高
  if (stdDev <= 1) return 100
  if (stdDev <= 2) return 90
  if (stdDev <= 3) return 80
  if (stdDev <= 5) return 60
  if (stdDev <= 7) return 40
  return 20
}
