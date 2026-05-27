import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Shuffle, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: API — replace with real data from backend
interface MockProject {
  id: string
  name: string
  domain: string
  assignedExperts: string[]
}

interface MockExpert {
  id: string
  name: string
  organization: string
  domain: string[]
}

const MOCK_PROJECTS: MockProject[] = [
  { id: 'p1', name: 'AI 分布式算力平台',    domain: '人工智能', assignedExperts: [] },
  { id: 'p2', name: '碳中和智能监测系统',    domain: '新能源',   assignedExperts: [] },
  { id: 'p3', name: '医疗影像 AI 辅助诊断', domain: '医疗健康', assignedExperts: [] },
  { id: 'p4', name: '智慧农业物联网平台',    domain: '农业科技', assignedExperts: [] },
  { id: 'p5', name: '新型储能材料研发',      domain: '新能源',   assignedExperts: [] },
]

const MOCK_EXPERTS: MockExpert[] = [
  { id: 'e1', name: '张教授',   organization: '清华大学',   domain: ['人工智能', '大数据'] },
  { id: 'e2', name: '李研究员', organization: '中科院',     domain: ['新能源', '材料'] },
  { id: 'e3', name: '王博士',   organization: '北京大学',   domain: ['医疗健康', '生物'] },
  { id: 'e4', name: '陈专家',   organization: '工业研究院', domain: ['农业科技', '物联网'] },
]

const LS_KEY = 'bochuangyuan:review-assignments'

function loadAssignments(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveAssignments(a: Record<string, string[]>) {
  localStorage.setItem(LS_KEY, JSON.stringify(a))
}

export default function AssignmentPage() {
  useParams<{ contestId: string }>()
  const [assignments, setAssignments] = useState<Record<string, string[]>>(loadAssignments)
  const [channelOpen, setChannelOpen] = useState(false)
  const [dragProjectId, setDragProjectId] = useState<string | null>(null)

  const assign = (projectId: string, expertId: string) => {
    setAssignments((prev) => {
      const next = { ...prev }
      if (!next[expertId]) next[expertId] = []
      if (!next[expertId].includes(projectId)) next[expertId] = [...next[expertId], projectId]
      saveAssignments(next)
      return next
    })
  }

  const unassign = (projectId: string, expertId: string) => {
    setAssignments((prev) => {
      const next = { ...prev, [expertId]: (prev[expertId] ?? []).filter((p) => p !== projectId) }
      saveAssignments(next)
      return next
    })
  }

  const autoAssign = () => {
    const next: Record<string, string[]> = {}
    MOCK_EXPERTS.forEach((e) => (next[e.id] = []))
    MOCK_PROJECTS.forEach((p, i) => {
      const expert = MOCK_EXPERTS[i % MOCK_EXPERTS.length] ?? MOCK_EXPERTS[0]
      if (!expert) return
      const expertId = expert.id
      next[expertId] = [...(next[expertId] ?? []), p.id]
    })
    setAssignments(next)
    saveAssignments(next)
  }

  const getExpertProjectCount = (expertId: string) =>
    (assignments[expertId] ?? []).length

  const getProjectExpert = (projectId: string): MockExpert | undefined => {
    for (const [expertId, pids] of Object.entries(assignments)) {
      if (pids.includes(projectId)) return MOCK_EXPERTS.find((e) => e.id === expertId)
    }
    return undefined
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">评审安排</h1>
          <p className="text-sm text-slate-400 mt-0.5">将参赛项目分配给评委专家</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={autoAssign}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold text-sm hover:bg-[#0ea5e9]/20 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            自动分配
          </button>
          <button
            onClick={() => setChannelOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors',
              channelOpen
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {channelOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {channelOpen ? '评审通道已开启' : '开启评审通道'}
          </button>
        </div>
      </div>

      {channelOpen && (
        <div className="glass-card p-4 bg-emerald-50 border-emerald-200 text-emerald-700 text-sm font-semibold">
          评审通道已开启 · 专家端可查看并提交评分
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            参赛项目 ({MOCK_PROJECTS.length})
          </h2>
          {MOCK_PROJECTS.map((project) => {
            const expert = getProjectExpert(project.id)
            return (
              <div
                key={project.id}
                draggable
                onDragStart={() => setDragProjectId(project.id)}
                onDragEnd={() => setDragProjectId(null)}
                className={cn(
                  'glass-card p-4 cursor-grab active:cursor-grabbing transition-shadow',
                  dragProjectId === project.id && 'shadow-lg ring-2 ring-[#0045c4]/30',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{project.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{project.domain}</p>
                  </div>
                  {expert ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#0045c4]/10 text-[#0045c4] flex-shrink-0">
                      {expert.name}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-400 flex-shrink-0">
                      未分配
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Experts */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            评委专家 ({MOCK_EXPERTS.length})
          </h2>
          {MOCK_EXPERTS.map((expert) => {
            const assigned = assignments[expert.id] ?? []
            return (
              <div
                key={expert.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragProjectId) {
                    // unassign from previous expert first
                    for (const [eid, pids] of Object.entries(assignments)) {
                      if (pids.includes(dragProjectId) && eid !== expert.id) {
                        unassign(dragProjectId, eid)
                      }
                    }
                    assign(dragProjectId, expert.id)
                    setDragProjectId(null)
                  }
                }}
                className="glass-card p-4 space-y-3 transition-all border-2 border-dashed border-transparent hover:border-[#0045c4]/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{expert.name}</p>
                    <p className="text-xs text-slate-400">{expert.organization}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {getExpertProjectCount(expert.id)} 个项目
                  </span>
                </div>

                {assigned.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {assigned.map((pid) => {
                      const proj = MOCK_PROJECTS.find((p) => p.id === pid)
                      return proj ? (
                        <span
                          key={pid}
                          className="group flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0045c4]/10 text-[#0045c4] cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                          onClick={() => unassign(pid, expert.id)}
                          title="点击取消分配"
                        >
                          {proj.name}
                          <span className="opacity-0 group-hover:opacity-100">×</span>
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                {assigned.length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-2">
                    拖拽项目到此处分配
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
