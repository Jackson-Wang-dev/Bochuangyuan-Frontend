import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComponentType } from 'react'
import type { PersonalityData } from '../types'

export type DimKey = 'strategy' | 'execution' | 'vision' | 'risk' | 'logic' | 'intuition'

export type AssessmentStep = 'intro' | 'testing' | 'loading' | 'result'

export const DIM_LABELS: Record<DimKey, string> = {
  strategy: '战略',
  execution: '执行',
  vision: '远见',
  risk: '冒险',
  logic: '逻辑',
  intuition: '直觉',
}

export interface QuestionOption {
  text: string
  value: string
  weight: Partial<Record<DimKey, number>>
}

export interface Question {
  id: number
  text: string
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '面对核心技术难题被竞争对手率先突破时，您的第一反应是？',
    options: [
      { text: '立即组织团队复盘，寻找差异化切入点', value: 'A', weight: { strategy: 10, execution: 5 } },
      { text: '寻找法律途径保护专利，通过诉讼争取时间', value: 'B', weight: { logic: 10, risk: 5 } },
      { text: '快速跟进并实现功能超越，发起价格战抢夺存量', value: 'C', weight: { execution: 10, intuition: 5 } },
    ],
  },
  {
    id: 2,
    text: '融资关键期，大客户突然要求大幅降价否则撤资，您会？',
    options: [
      { text: '坚持价值定价，哪怕融资失败也要保护商业模式', value: 'A', weight: { vision: 10, risk: 5 } },
      { text: '深度绑定，通过资源置换抵消降价损失', value: 'B', weight: { logic: 10, strategy: 5 } },
      { text: '暂时妥协以保住估值，融资到账后再调整策略', value: 'C', weight: { intuition: 10, execution: 5 } },
    ],
  },
  {
    id: 3,
    text: '团队内部对产品方向产生严重分歧，且双方皆有理有据？',
    options: [
      { text: '采用 AB 测试，由数据决定最终胜负', value: 'A', weight: { logic: 10, execution: 5 } },
      { text: '作为创始人乾纲独断，承担全部决策后果', value: 'B', weight: { vision: 10, risk: 5 } },
      { text: '寻找权威外部顾问进行第三方评估', value: 'C', weight: { intuition: 5, strategy: 5 } },
    ],
  },
]

export interface InsightItem {
  icon: ComponentType<{ className?: string }>
  label: string
  color: 'blue' | 'emerald' | 'amber'
  desc: string
}

export interface PersonaConfig {
  name: string
  keyword: string
  insights: InsightItem[]
  advice: string
}

// PERSONAS imported lazily by components to avoid bundling icons in the store
// They're defined here as data; icon components are bound at component level.
export type PersonaData = Omit<PersonaConfig, 'insights'> & {
  insights: Omit<InsightItem, 'icon'>[]
}

export const PERSONAS_DATA: Record<DimKey, PersonaData> = {
  strategy: {
    name: '战略型布局者',
    keyword: '先谋后动，棋盘永远比棋子重要',
    insights: [
      { label: '全局思维', color: 'blue', desc: '你在行动前习惯先建立完整框架，每一步都在服务整盘棋局，而不是局部最优。' },
      { label: '风险预判', color: 'emerald', desc: '极强的风险识别能力，让你在激进扩张中始终保持清醒的边界感。' },
      { label: '节奏把控', color: 'amber', desc: '你知道什么时候该快、什么时候该等，这是无法速成的经营直觉。' },
    ],
    advice: '你的战略能力是核心优势，但要警惕"分析瘫痪"。引入一名执行力强的合伙人，让精密的棋局真正跑起来。',
  },
  execution: {
    name: '极致执行者',
    keyword: '想到就做，跑赢所有只想不动的人',
    insights: [
      { label: '行动优先', color: 'amber', desc: '你天然相信"做了才知道"，不在信息不完整时瘫痪，这让你永远比对手快半步。' },
      { label: '目标拆解', color: 'blue', desc: '复杂目标在你手里会被分解成最小可执行单元，逐步推进，没有卡壳。' },
      { label: '抗干扰力', color: 'emerald', desc: '能屏蔽噪音保持专注，这让你在最混乱的阶段依然保持高产输出。' },
    ],
    advice: '执行力是你最大的护城河，但注意不要跑得太快而忽略了方向校准。定期停下来问一句"为什么"，是你提升的关键动作。',
  },
  vision: {
    name: '愿景型领导者',
    keyword: '活在未来五年，带着今天的人向前走',
    insights: [
      { label: '长期主义', color: 'blue', desc: '你的决策天然对齐长远目标，不会被短期的噪音和波动绑架。' },
      { label: '激励感召', color: 'amber', desc: '你能让身边的人相信一件还没发生的事，这是领导者最核心的能力。' },
      { label: '耐受模糊', color: 'emerald', desc: '你不需要完整的地图才能出发，这让你在早期创业阶段有巨大的先发优势。' },
    ],
    advice: '你能看得远，但要确保团队能跟上。给大家设置更近处的里程碑，不是降低标准，是保证大家都能跑到那个远处。',
  },
  risk: {
    name: '冒险型先行者',
    keyword: '在别人等红灯的路口，你已经找到了另一条路',
    insights: [
      { label: '高速迭代', color: 'amber', desc: '你愿意以小失败换大学习，认知升级速度远快于同龄人。' },
      { label: '机会嗅觉', color: 'blue', desc: '高风险偏好让你能看到别人不敢看、不愿看的机会窗口。' },
      { label: '心理韧性', color: 'emerald', desc: '你对不确定性有天然的容忍度，这是创业最硬核、最难习得的素质。' },
    ],
    advice: '冒险精神是你的引擎，但在关键决策前留出"冷却时间"。引入一名严谨的联创来平衡激进，会让你走得更稳更远。',
  },
  logic: {
    name: '体系型构建者',
    keyword: '没有系统的增长，都是在透支未来',
    insights: [
      { label: '结构化思维', color: 'blue', desc: '你能把混乱信息组织成可执行系统，而这正是公司规模化最坚实的基础。' },
      { label: '决策严谨', color: 'emerald', desc: '你不被情绪轻易带走，重要决策都经过逻辑验证，极少出现系统性失误。' },
      { label: '根因追溯', color: 'amber', desc: '你习惯追到问题的真正根因，而不是反复修补表面症状。' },
    ],
    advice: '你的逻辑能力让公司避免了很多系统性风险。但学会在 60% 信息时做决策，是你突破下一阶段瓶颈的核心课题。',
  },
  intuition: {
    name: '直觉型猎手',
    keyword: '感知先于数据，你的雷达就是你的护城河',
    insights: [
      { label: '市场感知', color: 'amber', desc: '你对用户和市场有超越数据的感应力，总能捕捉到别人忽视的微弱信号。' },
      { label: '机会识别', color: 'blue', desc: '你的直觉在识别人才和时机上特别准确，这是最难被复制的创业能力。' },
      { label: '快速决断', color: 'emerald', desc: '你不需要完整信息才能行动，这在瞬息万变的早期市场里是巨大优势。' },
    ],
    advice: '直觉是你最强的武器。让它更有说服力的方式是给它配上逻辑框架——学会把"我感觉"翻译成"数据显示"，你的判断会走得更远。',
  },
}

export function computeScores(answers: string[]): Record<DimKey, number> {
  const totals: Partial<Record<DimKey, number>> = {}
  answers.forEach((value, idx) => {
    const option = QUESTIONS[idx]?.options.find((o) => o.value === value)
    if (!option) return
    for (const [dim, weight] of Object.entries(option.weight) as [DimKey, number][]) {
      totals[dim] = (totals[dim] ?? 0) + weight
    }
  })
  const all: DimKey[] = ['strategy', 'execution', 'vision', 'risk', 'logic', 'intuition']
  const result = {} as Record<DimKey, number>
  for (const dim of all) {
    result[dim] = Math.min(100, Math.round(22 + ((totals[dim] ?? 0) / 25) * 72))
  }
  return result
}

export function getTopDim(scores: Record<DimKey, number>): DimKey {
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'strategy') as DimKey
}

export function scoresToRadarData(scores: Record<DimKey, number>): PersonalityData[] {
  return (Object.entries(scores) as [DimKey, number][]).map(([dim, value]) => ({
    subject: DIM_LABELS[dim],
    value,
    fullMark: 100,
  }))
}

interface AssessmentState {
  step: AssessmentStep
  currentIdx: number
  answers: string[]
  progress: number
  scores: Record<DimKey, number> | null
  startTest: () => void
  next: (value: string) => void
  reset: () => void
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      step: 'intro',
      currentIdx: 0,
      answers: [],
      progress: 0,
      scores: null,

      startTest: () => set({ step: 'testing' }),

      next: (value) => {
        const { answers, currentIdx } = get()
        const nextAnswers = [...answers, value]
        const nextIdx = currentIdx + 1
        const progress = (nextIdx / QUESTIONS.length) * 100

        if (nextIdx < QUESTIONS.length) {
          set({ answers: nextAnswers, currentIdx: nextIdx, progress })
        } else {
          const scores = computeScores(nextAnswers)
          set({ answers: nextAnswers, progress, scores, step: 'loading' })
          setTimeout(() => useAssessmentStore.setState({ step: 'result' }), 2500)
        }
      },

      reset: () => set({ step: 'intro', currentIdx: 0, answers: [], progress: 0, scores: null }),
    }),
    {
      name: 'bcy-assessment',
      partialize: ({ step, currentIdx, answers, progress, scores }) => ({
        // Don't persist loading state — snap to result if scores exist, otherwise intro
        step: step === 'loading' ? (scores ? 'result' : 'intro') : step,
        currentIdx,
        answers,
        progress,
        scores,
      }),
    },
  ),
)
