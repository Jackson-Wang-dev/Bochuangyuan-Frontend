import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Paperclip } from 'lucide-react'
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

const MOCK_TASK: ReviewTask = {
  taskId: 'task-1',
  projectId: 'proj-1',
  projectName: 'AI 分布式算力平台',
  projectDomain: '人工智能',
  submittedVersionId: 'ver-1',
  competitionId: 'comp-1',
  competitionName: '2024 全国大学生创业大赛',
  status: 'pending',
  deadline: '2024-06-30',
  assignedAt: '2024-06-01T10:00:00Z',
}

const MOCK_PROJECT_CONTENT = {
  summary: '本项目致力于构建一套基于区块链+AI调度的分布式算力平台，旨在将全球闲置GPU算力汇聚成一个统一资源池，为中小企业和科研机构提供低成本、高弹性的算力服务。',
  problem: '当前AI计算资源严重集中于少数云服务商，中小企业面临高成本、供应不稳定的问题。全球约40%的GPU算力处于低利用率状态。',
  solution: '通过自主研发的"算力路由协议（CRP）"，将分散的计算节点统一调度，利用区块链确保算力交易的透明性和可信性，AI模型进行实时负载均衡。',
  team: '核心团队来自清华大学计算机系，成员具备分布式系统、区块链与机器学习领域的研究背景，曾发表SCI论文8篇。',
  attachments: ['商业计划书v2.pdf', '技术方案白皮书.pdf'],
}

export default function ScoreFormPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { updateDraft, submitScore, getDraft } = useReviewStore()
  const [dimensions, setDimensions] = useState<ScoreDimension[]>(DEFAULT_DIMENSIONS)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contentOpen, setContentOpen] = useState(true)

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
    updateDraft(taskId, dimensions, comment)
  }

  const handleSubmit = async () => {
    if (submitting) return
    const confirm = window.confirm('提交后不可修改评分，确认提交？')
    if (!confirm) return
    setSubmitting(true)
    updateDraft(taskId, dimensions, comment)
    const finalScore = dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
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

      <h1 className="text-lg font-black text-slate-800">{MOCK_TASK.projectName}</h1>

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
            {Object.entries({
              '摘要': MOCK_PROJECT_CONTENT.summary,
              '问题': MOCK_PROJECT_CONTENT.problem,
              '解决方案': MOCK_PROJECT_CONTENT.solution,
              '团队': MOCK_PROJECT_CONTENT.team,
            }).map(([title, text]) => (
              <div key={title} className="glass-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}

            {MOCK_PROJECT_CONTENT.attachments.length > 0 && (
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> 附件
                </h3>
                {MOCK_PROJECT_CONTENT.attachments.map((name) => (
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
            dimensions={DEFAULT_DIMENSIONS.map((d) => ({ ...d, score: d.score + Math.floor(Math.random() * 10) - 5 }))}
            summary="该项目技术方案完整，算力路由协议具有一定创新性，市场需求验证充分。团队背景较强，但商业化路径仍需进一步完善。建议关注合规风险。"
            confidence={78}
          />
        </div>
      </div>
    </div>
  )
}
