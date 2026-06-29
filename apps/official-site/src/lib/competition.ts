import type { CompetitionCategory } from '../types'

export const COMPETITION_CATEGORIES: CompetitionCategory[] = ['创新赛事', '人才项目']

export const COMPETITION_TRACK_TAGS = ['AI', '互联网', '电商', '新能源', '生物医疗', '社会公益'] as const

export function getDaysRemaining(deadline: string): number {
  const target = new Date(deadline).getTime()
  if (Number.isNaN(target)) return NaN
  const diffMs = target - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function formatCountdown(deadline: string): string {
  const days = getDaysRemaining(deadline)
  if (Number.isNaN(days)) return ''
  if (days < 0) return '已截止'
  if (days === 0) return '今日截止'
  return `剩 ${days} 天`
}
