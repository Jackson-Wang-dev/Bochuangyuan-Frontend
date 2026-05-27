import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Paperclip, EyeOff, Eye, User, School, Phone, Mail, Users } from 'lucide-react'
import { ScorePanel } from '@/components/ScorePanel'
import { AiSuggestion } from '@/components/AiSuggestion'
import { useReviewStore } from '@/store/reviewStore'
import type { ReviewTask, ScoreDimension } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

const DEFAULT_DIMENSIONS: ScoreDimension[] = [
  { key: 'technology', label: '技术成熟度', score: 70, weight: 30 },
  { key: 'market',     label: '市场前景',   score: 70, weight: 30 },
  { key: 'team',       label: '团队能力',   score: 70, weight: 20 },
  { key: 'innovation', label: '创新性',     score: 70, weight: 20 },
]

interface MockDetail {
  task: ReviewTask
  content: {
    summary: string
    problem: string
    solution: string
    team: string
    attachments: string[]
  }
}

// TODO: replace with fetchTaskDetail(taskId) from @/api/review
const MOCK_DETAILS: Record<string, MockDetail> = {
  'task-1': {
    task: {
      taskId: 'task-1',
      projectId: 'proj-1',
      projectName: 'AI 分布式算力平台',
      projectDomain: '人工智能',
      submittedVersionId: 'ver-1',
      competitionId: 'comp-1',
      competitionName: '2024 全国大学生创业大赛',
      status: 'pending',
      reviewStage: 'initial',
      deadline: '2024-06-30',
      assignedAt: '2024-06-01T10:00:00Z',
    },
    content: {
      summary: '本项目致力于构建一套基于区块链+AI调度的分布式算力平台，旨在将全球闲置GPU算力汇聚成一个统一资源池，为中小企业和科研机构提供低成本、高弹性的算力服务。',
      problem: '当前AI计算资源严重集中于少数云服务商，中小企业面临高成本、供应不稳定的问题。全球约40%的GPU算力处于低利用率状态。',
      solution: '通过自主研发的"算力路由协议（CRP）"，将分散的计算节点统一调度，利用区块链确保算力交易的透明性和可信性，AI模型进行实时负载均衡。',
      team: '某重点高校理工科团队，团队成员具备人工智能与分布式系统领域的研究背景，有一定的学术论文发表记录。',
      attachments: ['商业计划书v2.pdf', '技术方案白皮书.pdf'],
    },
  },
  'task-2': {
    task: {
      taskId: 'task-2',
      projectId: 'proj-2',
      projectName: '碳中和智能监测系统',
      projectDomain: '新能源',
      submittedVersionId: 'ver-2',
      competitionId: 'comp-1',
      competitionName: '2024 全国大学生创业大赛',
      status: 'scoring',
      reviewStage: 'initial',
      deadline: '2024-06-30',
      assignedAt: '2024-06-01T10:00:00Z',
    },
    content: {
      summary: '利用物联网传感器网络与大数据分析，构建覆盖工业园区、交通、建筑的碳排放实时监测平台，为企业碳中和目标提供数据支撑与决策建议。',
      problem: '企业碳排放数据采集依赖人工填报，数据滞后且准确性低，难以满足"双碳"政策对实时监测的要求。',
      solution: '部署低功耗传感器网络，结合边缘计算与云端分析，实现毫秒级碳排放数据采集与AI预测预警，并提供合规报告自动生成功能。',
      team: '某高校新能源与信息工程交叉方向团队，具备物联网系统研发与大数据分析的工程实践经验。',
      attachments: ['产品演示视频.mp4', '市场调研报告.pdf'],
    },
  },
  'task-3': {
    task: {
      taskId: 'task-3',
      projectId: 'proj-3',
      projectName: '医疗影像 AI 辅助诊断',
      projectDomain: '医疗健康',
      submittedVersionId: 'ver-3',
      competitionId: 'comp-1',
      competitionName: '2024 全国大学生创业大赛',
      status: 'pending',
      reviewStage: 'final',
      deadline: '2024-06-30',
      assignedAt: '2024-06-01T10:00:00Z',
      submitter: {
        name: '陈晓雨',
        school: '复旦大学',
        phone: '139****6677',
        email: 'chen***@fudan.edu.cn',
        teamName: '影像先锋队',
      },
    },
    content: {
      summary: '基于深度学习的医疗影像 AI 辅助诊断系统，针对肺结节、眼底病变等高发疾病提供毫秒级精准筛查，已与3家三甲医院完成联合临床验证。',
      problem: '基层医院影像科医生严重不足，漏诊误诊率高达15%-20%，患者等待报告时间长，医疗资源分布极度不均。',
      solution: '采用自研多模态融合神经网络，对CT、MRI、眼底图像进行端到端分析，AUC达0.97，辅助医生将诊断效率提升3倍以上，并支持私有化部署保障数据合规。',
      team: '核心团队来自复旦大学计算机科学系与附属医院，成员具备医学影像处理与深度学习的跨学科研究背景，已发表SCI论文6篇，获得发明专利2项。',
      attachments: ['临床验证报告.pdf', '技术白皮书.pdf', '商业计划书.pdf'],
    },
  },
}

const FALLBACK_DETAIL = MOCK_DETAILS['task-1']

export default function ScoreFormPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { updateDraft, submitScore, getDraft } = useReviewStore()
  const [dimensions, setDimensions] = useState<ScoreDimension[]>(DEFAULT_DIMENSIONS)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contentOpen, setContentOpen] = useState(true)

  const detail = taskId ? (MOCK_DETAILS[taskId] ?? FALLBACK_DETAIL) : FALLBACK_DETAIL
  const { task, content } = detail
  const isBlind = task.reviewStage === 'initial'

  const aiDimensions = useMemo(
    () => DEFAULT_DIMENSIONS.map((d) => ({ ...d, score: d.score + Math.floor(Math.random() * 10) - 5 })),
    [task.taskId],
  )

  useEffect(() => {
    if (!taskId) return
    const draft = getDraft(taskId)
    if (draft) {
      setDimensions(draft.dimensions)
      setComment(draft.overallComment)
    }
  }, [taskId, getDraft])

  if (!taskId) return <Navigate to="/review/queue" replace />

  const handleDimensionChange = (key: string, score: number) => {
    setDimensions((prev) => prev.map((d) => d.key === key ? { ...d, score } : d))
  }

  const handleSaveDraft = () => {
    // TODO: also call saveDraft(taskId, draft) from @/api/review to persist on server
    updateDraft(taskId, dimensions, comment)
  }

  const handleSubmit = async () => {
    if (submitting) return
    const confirm = window.confirm('提交后不可修改评分，确认提交？')
    if (!confirm) return
    setSubmitting(true)
    updateDraft(taskId, dimensions, comment)
    const finalScore = dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
    // TODO: replace local submitScore with submitScore(taskId, draft) from @/api/review
    submitScore(taskId, Math.round(finalScore * 10) / 10)
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Back */}
      <button
        onClick={() => navigate('/review/queue')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回队列
      </button>

      {/* Stage banner */}
      {isBlind ? (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-700 text-sm font-semibold">
          <EyeOff className="w-4 h-4 flex-shrink-0" />
          <span>盲审阶段 · 参赛者身份信息已隐藏，请基于项目内容客观评审</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-blue-50 border-blue-200 text-blue-700 text-sm font-semibold">
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span>复审阶段 · 可查看参赛者完整信息</span>
        </div>
      )}

      <h1 className="text-lg font-black text-slate-800">{task.projectName}</h1>

      {submitted && (
        <div className="glass-card p-4 bg-emerald-50 border-emerald-200 text-emerald-700 text-sm font-semibold text-center">
          评分已提交，感谢您的评审！
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: project content */}
        <div className="flex-1 space-y-3">
          {/* Toggle on mobile */}
          <button
            onClick={() => setContentOpen((v) => !v)}
            className="md:hidden w-full glass-card px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-700"
          >
            项目内容
            {contentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={cn('space-y-3', !contentOpen && 'hidden md:block')}>
            {/* 参赛者信息 — 仅复审可见 */}
            {!isBlind && task.submitter && (
              <div className="glass-card p-4 space-y-3 border-blue-200 bg-blue-50/40">
                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  参赛者信息
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-400 w-12 flex-shrink-0">姓名</span>
                    <span className="font-semibold">{task.submitter.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <School className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-400 w-12 flex-shrink-0">院校</span>
                    <span className="font-semibold">{task.submitter.school}</span>
                  </div>
                  {task.submitter.teamName && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400 w-12 flex-shrink-0">队伍</span>
                      <span className="font-semibold">{task.submitter.teamName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-400 w-12 flex-shrink-0">电话</span>
                    <span className="font-semibold">{task.submitter.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-400 w-12 flex-shrink-0">邮箱</span>
                    <span className="font-semibold">{task.submitter.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Project sections */}
            {(
              [
                ['摘要', content.summary],
                ['问题', content.problem],
                ['解决方案', content.solution],
              ] as [string, string][]
            ).map(([title, text]) => (
              <div key={title} className="glass-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}

            {/* Team section — desensitized in blind review */}
            <div className="glass-card p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                团队
                {isBlind && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded normal-case tracking-normal">
                    <EyeOff className="w-2.5 h-2.5" />
                    已脱敏
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{content.team}</p>
            </div>

            {/* Attachments */}
            {content.attachments.length > 0 && (
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> 附件
                </h3>
                {content.attachments.map((name) => (
                  <div key={name} className="flex items-center gap-2 text-sm text-brand-blue hover:underline cursor-pointer">
                    <Paperclip className="w-3.5 h-3.5" />{name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: score panel */}
        <div className="md:w-72 lg:w-80 space-y-4 flex-shrink-0">
          <ScorePanel
            dimensions={dimensions}
            overallComment={comment}
            readonly={submitted}
            submitting={submitting}
            onDimensionChange={handleDimensionChange}
            onCommentChange={setComment}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />

          <AiSuggestion
            dimensions={aiDimensions}
            summary="该项目技术方案完整，具有一定创新性，市场需求验证充分。团队背景较强，但商业化路径仍需进一步完善。建议关注合规风险。"
            confidence={78}
          />
        </div>
      </div>
    </div>
  )
}
