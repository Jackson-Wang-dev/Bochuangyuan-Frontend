import type { ExpertTask } from '@bochuangyuan/types'

export const MOCK_EXPERT_ID = 'e1'

export interface ExpertCompetition {
  contestId: string
  name: string
  status: 'open' | 'reviewing' | 'closed' | 'finished'
  currentPhase: ExpertTask['phase']
  deadline?: string
}

export const MOCK_COMPETITIONS: ExpertCompetition[] = [
  {
    contestId: 'comp-1',
    name: '2024 全国大学生创业大赛',
    status: 'reviewing',
    currentPhase: 'preliminary',
    deadline: '2026-06-15',
  },
  {
    contestId: 'comp-2',
    name: '2024 博创杯双创大赛',
    status: 'reviewing',
    currentPhase: 'preliminary',
    deadline: '2026-07-20',
  },
]

export const SEED_TASKS: ExpertTask[] = [
  {
    id: 'et-1',
    phase: 'preliminary',
    projectId: 'p1',
    projectName: 'AI 分布式算力平台',
    projectSummary:
      '构建基于区块链+AI调度的分布式算力平台，将全球闲置GPU算力汇聚成统一资源池，为中小企业和科研机构提供低成本、高弹性的算力服务。',
    attachments: [
      { name: '商业计划书v2.pdf', url: '#', type: 'pdf' },
      { name: '技术方案白皮书.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'e1',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-1',
  },
  {
    id: 'et-2',
    phase: 'preliminary',
    projectId: 'p2',
    projectName: '碳中和智能监测系统',
    projectSummary:
      '利用物联网传感器与大数据分析，构建覆盖工业园区的碳排放实时监测平台，为企业碳中和提供数据支撑与决策建议。',
    attachments: [{ name: '产品演示视频.mp4', url: '#', type: 'video' }],
    expertId: 'e1',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-1',
  },
  {
    id: 'et-3',
    phase: 'semifinal',
    projectId: 'p3',
    projectName: '医疗影像 AI 辅助诊断',
    projectSummary:
      '基于深度学习的医疗影像AI辅助诊断系统，针对肺结节、眼底病变提供毫秒级精准筛查，已与3家三甲医院完成联合临床验证。',
    attachments: [
      { name: '临床验证报告.pdf', url: '#', type: 'pdf' },
      { name: '技术白皮书.pdf', url: '#', type: 'pdf' },
    ],
    expertId: 'e1',
    status: 'in_progress',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-1',
  },
  {
    id: 'et-4',
    phase: 'preliminary',
    projectId: 'p4',
    projectName: '智慧农业无人机系统',
    projectSummary:
      '基于多光谱成像与AI病虫害识别技术的无人机农业服务平台，已覆盖5个省份的农业生产场景，累计作业面积超30万亩。',
    attachments: [{ name: '产品介绍.pdf', url: '#', type: 'pdf' }],
    expertId: 'e1',
    status: 'pending',
    scores: [],
    comment: '',
    recommendAdvance: false,
    contestId: 'comp-2',
  },
  {
    id: 'et-5',
    phase: 'preliminary',
    projectId: 'p5',
    projectName: '新能源汽车动力电池回收',
    projectSummary:
      '构建梯次利用与高效回收的动力电池全生命周期管理体系，已与多家主机厂签署战略合作协议。',
    expertId: 'e1',
    status: 'submitted',
    scores: [
      { dimensionId: 'dim-1', score: 8 },
      { dimensionId: 'dim-2', score: 7 },
      { dimensionId: 'dim-3', score: 9 },
    ],
    comment: '项目具有良好的商业前景和社会价值，团队执行力强。',
    recommendAdvance: true,
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    contestId: 'comp-2',
  },
]
