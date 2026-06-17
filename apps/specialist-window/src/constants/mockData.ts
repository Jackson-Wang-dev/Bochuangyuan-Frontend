import type { ExpertTask } from '@bochuangyuan/types'

// Must match MockReviewService's currentExpertId default
export const MOCK_EXPERT_ID = 'exp-a'

export interface ExpertCompetition {
  contestId: string
  name: string
  status: 'open' | 'reviewing' | 'closed' | 'finished'
  currentPhase: ExpertTask['phase']
  deadline?: string
}

// IDs aligned with MockReviewService COMPETITIONS seed data
export const MOCK_COMPETITIONS: ExpertCompetition[] = [
  {
    contestId: 'comp-bcup',
    name: '博创杯双创大赛 2024',
    status: 'reviewing',
    currentPhase: 'preliminary',
    deadline: '2026-07-20',
  },
  {
    contestId: 'comp-nat',
    name: '全国大学生创业大赛 2024',
    status: 'reviewing',
    currentPhase: 'semifinal',
    deadline: '2026-07-15',
  },
  {
    contestId: 'comp-carbon',
    name: '绿色双碳创新创业大赛',
    status: 'reviewing',
    currentPhase: 'preliminary',
    deadline: '2026-08-01',
  },
]

// projectId and contestId aligned with MockReviewService PROJECTS/COMPETITIONS seed data.
// Scores use the real dimension IDs and 0-100 scale matching MockReviewService rubrics.
export const SEED_TASKS: ExpertTask[] = [
  {
    id: 'et-1',
    phase: 'preliminary',
    projectId: 'proj-1',
    projectName: 'AI 分布式算力平台',
    projectSummary:
      '基于区块链+AI调度的分布式算力平台，将全球闲置 GPU 算力汇聚成统一资源池，为中小企业和科研机构提供低成本、高弹性的算力服务。',
    attachments: [
      { name: '商业计划书v2.pdf', url: '#', type: 'pdf' },
      { name: '技术方案白皮书.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'exp-a',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-bcup',
  },
  {
    id: 'et-2',
    phase: 'preliminary',
    projectId: 'proj-2',
    projectName: '碳中和智能监测系统',
    projectSummary:
      '利用 IoT 多模态传感器与边缘 AI，构建覆盖工业园区的碳排放实时监测平台，合规报告生成从 5 天压缩至 2 小时。',
    attachments: [{ name: '产品演示视频.mp4', url: '#', type: 'video' }],
    expertId: 'exp-a',
    status: 'submitted',
    scores: [
      { dimensionId: 'dim-carb-1', score: 78 },
      { dimensionId: 'dim-carb-2', score: 82 },
      { dimensionId: 'dim-carb-3', score: 75 },
    ],
    comment: '团队技术背景扎实，产品思路清晰，政策驱动明确。需关注客户多元化节奏。',
    recommendAdvance: false,
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    contestId: 'comp-carbon',
  },
  {
    id: 'et-3',
    phase: 'semifinal',
    projectId: 'proj-3',
    projectName: '医疗影像 AI 辅助诊断',
    projectSummary:
      '基于深度学习的医疗影像 AI 辅助诊断系统，针对肺结节、眼底病变提供毫秒级精准筛查，已与 3 家三甲医院完成联合临床验证。',
    attachments: [
      { name: '临床验证报告.pdf', url: '#', type: 'pdf' },
      { name: '技术白皮书.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'exp-a',
    status: 'in_progress',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-nat',
  },
  {
    id: 'et-4',
    phase: 'preliminary',
    projectId: 'proj-4',
    projectName: '智慧农业无人机系统',
    projectSummary:
      '基于多光谱成像与 AI 病虫害识别技术的无人机农业服务平台，已覆盖 5 个省份，累计作业面积超 32 万亩。',
    attachments: [{ name: '产品介绍.pdf', url: '#', type: 'pdf' }],
    expertId: 'exp-a',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-bcup',
  },
  {
    id: 'et-5',
    phase: 'preliminary',
    projectId: 'proj-5',
    projectName: '动力电池全生命周期管理平台',
    projectSummary:
      '退役动力电池梯次评估—再制造—高值回收一体化平台，材料综合回收率超 95%，锂回收率 96.3%，较行业均值高出 26 个百分点。',
    attachments: [
      { name: '中试验证报告.pdf', url: '#', type: 'pdf' },
      { name: '工艺流程图.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'exp-a',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-carbon',
  },
  {
    id: 'et-6',
    phase: 'semifinal',
    projectId: 'proj-6',
    projectName: '量子密钥分发即服务平台',
    projectSummary:
      '将量子密钥分发能力封装为云服务 API，自研 QRNG 芯片将设备成本降至行业 1/5，已与中国电信完成城域网试点（5 节点，38km，稳定运行 183 天）。',
    attachments: [
      { name: 'QRNG芯片测试报告.pdf', url: '#', type: 'pdf' },
      { name: '城域网试点验收报告.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'exp-a',
    status: 'in_progress',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-nat',
  },
  {
    id: 'et-7',
    phase: 'preliminary',
    projectId: 'proj-7',
    projectName: '智慧居家养老健康监护系统',
    projectSummary:
      '毫米波雷达+边缘 AI 无接触监测心率、呼吸、跌倒，家属 App 推送，120 秒触达紧急联系人，硬件成本 780 元/套，已完成 3 个社区养老中心 POC。',
    attachments: [{ name: 'POC验证报告.pdf', url: '#', type: 'pdf' }],
    expertId: 'exp-a',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-bcup',
  },
  {
    id: 'et-8',
    phase: 'preliminary',
    projectId: 'proj-8',
    projectName: '跨境电商 AI 选品与供应链平台',
    projectSummary:
      '一站式跨境 SaaS：选品命中率 78%（行业均值 45%），LLM 合规审查覆盖 60 国，付费商家 1200+，月均 GMV 增速 35%，已自举盈利 186 万元。',
    expertId: 'exp-a',
    status: 'submitted',
    scores: [
      { dimensionId: 'dim-bcup-1', score: 70 },
      { dimensionId: 'dim-bcup-2', score: 88 },
      { dimensionId: 'dim-bcup-3', score: 82 },
      { dimensionId: 'dim-bcup-4', score: 91 },
    ],
    comment: '极具说服力的产品市场契合度，建议重点追问 LLM 合规引擎更新机制与平台政策依赖风险。',
    recommendAdvance: true,
    submittedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    contestId: 'comp-bcup',
  },
]
