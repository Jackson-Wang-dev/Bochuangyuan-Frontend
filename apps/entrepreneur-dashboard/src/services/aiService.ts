import type { FieldChange, GrowthRadarSnapshot, ProjectEvent } from '@/types/project'

// ── Compact change formatter ───────────────────────────────────────────────────

function countEditGroups(segments: { type: string }[]): number {
  let groups = 0
  let wasUnchanged = true
  for (const s of segments) {
    if (s.type !== 'unchanged') { if (wasUnchanged) groups++; wasUnchanged = false }
    else wasUnchanged = true
  }
  return groups
}

function formatChanges(changes: FieldChange[]): string {
  if (changes.length === 0) return ''
  return changes.map((c) => {
    if (c.diffType === 'scalar') {
      return `  ${c.label}: ${c.oldValue} → ${c.newValue}`
    }
    if (c.diffType === 'text') {
      const n = countEditGroups(c.segments)
      return `  ${c.label}: 修改了 ${n} 处`
    }
    // collection
    const parts: string[] = []
    if (c.added.length)    parts.push(`新增 ${c.added.join('、')}`)
    if (c.removed.length)  parts.push(`删除 ${c.removed.join('、')}`)
    if (c.modified.length) parts.push(`修改了 ${c.modified.map((m) => m.itemSummary).join('、')} 的字段`)
    return `  ${c.label}: ${parts.join('；')}`
  }).join('\n')
}

function formatRadar(r: GrowthRadarSnapshot): string {
  return [
    `团队${r.teamSize}人`,
    `专利${r.patentCount}件`,
    `软著${r.softwareCopyrightCount}件`,
    `论文${r.paperCount}篇`,
    r.totalFunding > 0 ? `融资额${r.totalFunding}万` : '融资—',
    `成熟度${r.maturityScore}分`,
  ].join('，')
}

// ── Input / Output types ──────────────────────────────────────────────────────

export interface ReviewInput {
  projectName: string
  events: ProjectEvent[]
  currentRadar: GrowthRadarSnapshot
}

export interface ComparisonInput {
  projectName: string
  nodeA: { timestamp: string; description: string; radar: GrowthRadarSnapshot }
  nodeB: { timestamp: string; description: string; radar: GrowthRadarSnapshot }
  eventsBetween: ProjectEvent[]
}

// ── Service interface ─────────────────────────────────────────────────────────

export interface AIGrowthService {
  generateReview(input: ReviewInput): Promise<string>
  generateComparison(input: ComparisonInput): Promise<string>
}

// ── Configuration ─────────────────────────────────────────────────────────────

export interface AIServiceConfig {
  /** 'mock' uses canned responses (no network); 'deepseek' / 'qwen' call real API */
  provider: 'deepseek' | 'qwen' | 'mock'
  apiKey: string
  /** Base URL of the OpenAI-compatible endpoint */
  baseUrl: string
  model: string
}

export const AI_CONFIG: AIServiceConfig = {
  provider: (import.meta.env['VITE_AI_PROVIDER'] as AIServiceConfig['provider']) || 'mock',
  apiKey:   import.meta.env['VITE_AI_API_KEY']  || '',
  baseUrl:  import.meta.env['VITE_AI_BASE_URL'] || 'https://api.deepseek.com',
  model:    import.meta.env['VITE_AI_MODEL']    || 'deepseek-chat',
}

// ── OpenAI-compatible HTTP call ───────────────────────────────────────────────

interface ChatMessage  { role: 'system' | 'user' | 'assistant'; content: string }
interface ChatResponse { choices: { message: { content: string } }[] }

async function chatCompletion(
  config: AIServiceConfig,
  messages: ChatMessage[],
): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    })
  } catch {
    throw new Error('网络连接失败，请检查网络后重试')
  }
  if (!res.ok) {
    const errMsg =
      res.status === 401 ? 'API Key 无效或已过期，请检查配置' :
      res.status === 403 ? '无访问权限，请确认 API Key 权限范围' :
      res.status === 429 ? '请求频率超限，请稍后重试' :
      res.status >= 500  ? `AI 服务端错误（${res.status}），请稍后重试` :
                           `请求失败（${res.status}）`
    throw new Error(errMsg)
  }
  const data = await res.json() as ChatResponse
  const content = data.choices[0]?.message.content?.trim()
  if (!content) throw new Error('AI 返回内容为空，请重试')
  return content
}

// ── Prompt builders ───────────────────────────────────────────────────────────

// TODO §3.3 增量输入缓存（待设计）
// 需求：首次喂初始状态 AI 简要总结，之后只追加增量变更（缩减重复 token）。
// 现状：每次调用都把全部 events 发给模型，成本随事件数线性增长。
// 待做：持久化首次 AI 摘要（store / localStorage），记录"上次摘要到哪条 eventId"，
//       后续调用带入缓存摘要 + 仅追加新 events。

const SYSTEM_PROMPT =
  '你是一个专业的创业项目成长分析助手，帮助创业者用简洁、积极的语言回顾和分析项目的成长历程。用中文回答，言简意赅，不要逐条重复原始数据。'

function buildReviewMessages(input: ReviewInput): ChatMessage[] {
  const sorted = [...input.events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const history = sorted.map((ev) => {
    const head = `${ev.timestamp.slice(0, 10)} [${ev.type}] ${ev.description}`
    const body = formatChanges(ev.changes)
    return body ? `${head}\n${body}` : head
  }).join('\n\n')

  const user = `项目：${input.projectName}
当前状态：${formatRadar(input.currentRadar)}

成长历程（时序）：
${history}

请用不超过250字，叙述这个项目从创立到现在的成长历程，突出关键里程碑与变化趋势，有分析性地点出当前所处阶段与主要短板。`

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: user },
  ]
}

function buildComparisonMessages(input: ComparisonInput): ChatMessage[] {
  const { nodeA: a, nodeB: b } = input
  const sorted = [...input.eventsBetween].sort((x, y) => x.timestamp.localeCompare(y.timestamp))
  const between = sorted.length
    ? sorted.map((ev) => {
        const head = `${ev.timestamp.slice(0, 10)} ${ev.description}`
        const body = formatChanges(ev.changes)
        return body ? `${head}\n${body}` : head
      }).join('\n\n')
    : '（两节点相邻，无中间事件）'

  const radarDelta = [
    b.radar.teamSize               !== a.radar.teamSize               ? `团队规模 ${a.radar.teamSize}→${b.radar.teamSize}人`       : '',
    b.radar.patentCount            !== a.radar.patentCount            ? `专利 ${a.radar.patentCount}→${b.radar.patentCount}件`      : '',
    b.radar.softwareCopyrightCount !== a.radar.softwareCopyrightCount ? `软著 ${a.radar.softwareCopyrightCount}→${b.radar.softwareCopyrightCount}件` : '',
    b.radar.paperCount             !== a.radar.paperCount             ? `论文 ${a.radar.paperCount}→${b.radar.paperCount}篇`        : '',
    b.radar.totalFunding           !== a.radar.totalFunding           ? `融资额 ${a.radar.totalFunding}→${b.radar.totalFunding}万`  : '',
    b.radar.maturityScore          !== a.radar.maturityScore          ? `成熟度 ${a.radar.maturityScore}→${b.radar.maturityScore}分` : '',
  ].filter(Boolean).join('，') || '各维度无变化'

  const user = `项目：${input.projectName}

节点 A（${a.timestamp.slice(0, 10)} · ${a.description}）：${formatRadar(a.radar)}
节点 B（${b.timestamp.slice(0, 10)} · ${b.description}）：${formatRadar(b.radar)}

雷达变化：${radarDelta}

两节点之间的主要变更：
${between}

请用不超过200字：①分析项目在这段时间内的主要进展；②解读雷达变化反映了什么；③指出当前最值得关注的短板。`

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: user },
  ]
}

// ── Real service (DeepSeek / Qwen, OpenAI-compatible) ────────────────────────

function createRealService(config: AIServiceConfig): AIGrowthService {
  return {
    generateReview:     (input) => chatCompletion(config, buildReviewMessages(input)),
    generateComparison: (input) => chatCompletion(config, buildComparisonMessages(input)),
  }
}

// ── Mock service (no network, realistic canned responses for demo) ────────────

const MOCK_REVIEW =
  `NovaMed 从 2024 年起以医学影像 AI 辅助诊断为核心赛道，早期专注于技术验证与市场洞察。\
2025 年初，团队对项目背景中的市场缺口数据进行了深度细化，标志着从"讲清楚做什么"进入"讲清楚为什么"的叙事阶段。\
随后，核心成员登记信息的规范化与医疗器械注册专家的引进，体现出技术合规与团队扩张的双轨并行。\
进入 2026 年，A 轮 500 万元融资落地，营收翻番，投入预测大幅上调——项目已从资源储备期跃入规模化验证阶段。\
当前短板在于运营与商务能力尚需补强，团队知识结构仍以技术向为主。`

const MOCK_COMPARISON =
  `在节点 A 到节点 B 约一年的时间里，项目实现了从"技术验证期"向"资本驱动期"的关键跃迁。\
融资额从 200 万跃至 500 万（+150%），成熟度评分上升 20 分，专利储备增至 3 件，三项核心指标同步突破，\
反映出资本认可与技术积累相互强化的正向循环。雷达变化尤其体现在成熟度和融资维度，说明项目已从"可期待"变为"被验证"。\
当前最值得关注的短板是论文与软著数量未有增长——在高层次人才项目申报中，学术输出量往往是初审权重较高的维度，建议优先补强。`

function createMockService(): AIGrowthService {
  return {
    generateReview:     () => new Promise((res) => setTimeout(() => res(MOCK_REVIEW),     1400)),
    generateComparison: () => new Promise((res) => setTimeout(() => res(MOCK_COMPARISON), 1400)),
  }
}

// ── Factory (lazy singleton per config) ──────────────────────────────────────

let _instance:       AIGrowthService | null = null
let _instanceKey:    string | null = null

export function getAIGrowthService(config = AI_CONFIG): AIGrowthService {
  const key = `${config.provider}:${config.apiKey}:${config.model}`
  if (_instance && _instanceKey === key) return _instance
  _instance    = (!config.apiKey || config.provider === 'mock')
    ? createMockService()
    : createRealService(config)
  _instanceKey = key
  return _instance
}
