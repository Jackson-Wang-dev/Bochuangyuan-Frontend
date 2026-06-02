import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Users, BarChart2, Award, Save, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import type { ReviewStage } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

// ---- types ----
interface ProjectItem { projectId: string; name: string; teamName: string }
interface JudgeItem   { judgeId: string;  name: string; org: string }
interface ScoreCell   { projectId: string; judgeId: string; score: number; submitted: boolean }

// ---- mock data ----
const MOCK_PROJECTS: ProjectItem[] = [
  { projectId: 'proj-1', name: 'AI 分布式算力平台',   teamName: '算力先锋队' },
  { projectId: 'proj-2', name: '碳中和智能监测系统',  teamName: '绿能科技' },
  { projectId: 'proj-3', name: '医疗影像 AI 辅助诊断',teamName: '健影团队' },
  { projectId: 'proj-4', name: '智慧农业物联网平台',  teamName: '田间智慧' },
  { projectId: 'proj-5', name: '区块链供应链溯源',    teamName: '链信科技' },
]

const MOCK_JUDGES: JudgeItem[] = [
  { judgeId: 'j-1', name: '张志远', org: '清华大学' },
  { judgeId: 'j-2', name: '李梅',   org: '北京大学' },
  { judgeId: 'j-3', name: '王峰',   org: '字节跳动' },
]

const MOCK_SCORES: ScoreCell[] = [
  { projectId: 'proj-1', judgeId: 'j-1', score: 85, submitted: true  },
  { projectId: 'proj-1', judgeId: 'j-2', score: 88, submitted: true  },
  { projectId: 'proj-2', judgeId: 'j-1', score: 78, submitted: true  },
  { projectId: 'proj-2', judgeId: 'j-2', score: 82, submitted: true  },
  { projectId: 'proj-2', judgeId: 'j-3', score: 79, submitted: false },
  { projectId: 'proj-3', judgeId: 'j-1', score: 92, submitted: true  },
  { projectId: 'proj-3', judgeId: 'j-2', score: 88, submitted: true  },
  { projectId: 'proj-3', judgeId: 'j-3', score: 90, submitted: true  },
  { projectId: 'proj-4', judgeId: 'j-2', score: 75, submitted: true  },
  { projectId: 'proj-4', judgeId: 'j-3', score: 71, submitted: false },
  { projectId: 'proj-5', judgeId: 'j-3', score: 95, submitted: true  },
]

// Default assignment: which projectIds each judge is responsible for
const DEFAULT_ASSIGNMENTS: Record<string, string[]> = {
  'j-1': ['proj-1', 'proj-2', 'proj-3'],
  'j-2': ['proj-1', 'proj-2', 'proj-3', 'proj-4'],
  'j-3': ['proj-2', 'proj-3', 'proj-4', 'proj-5'],
}

const STAGE_LABEL: Record<ReviewStage, string> = {
  Prelim:     '初审',
  Semifinal:  '复赛',
  Final:      '决赛',
}

// ---- Sub-tab: Assignment ----
function AssignmentTab({ competitionId }: { competitionId: string }) {
  const [assignments, setAssignments] = useState<Record<string, string[]>>({ ...DEFAULT_ASSIGNMENTS })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (judgeId: string, projectId: string) => {
    setAssignments((prev) => {
      const cur = prev[judgeId] ?? []
      return {
        ...prev,
        [judgeId]: cur.includes(projectId) ? cur.filter((id) => id !== projectId) : [...cur, projectId],
      }
    })
    setSaved(false)
  }

  const autoAssign = () => {
    const perJudge = Math.ceil(MOCK_PROJECTS.length / MOCK_JUDGES.length)
    const newAssign: Record<string, string[]> = {}
    MOCK_JUDGES.forEach((judge, i) => {
      newAssign[judge.judgeId] = MOCK_PROJECTS
        .slice(i * perJudge, (i + 1) * perJudge)
        .map((p) => p.projectId)
    })
    setAssignments(newAssign)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">点击单元格切换分配 · 每位评委至少分配 2 个项目</p>
        <div className="flex gap-2">
          <button onClick={autoAssign}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> 均匀分配
          </button>
          <button onClick={handleSave} disabled={saving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors',
              saved ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:bg-brand-blue/90',
              saving && 'opacity-60',
            )}>
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? '保存中…' : saved ? '已保存' : '保存分配'}
          </button>
        </div>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">项目名称</th>
              {MOCK_JUDGES.map((j) => (
                <th key={j.judgeId} className="px-4 py-3 text-center font-semibold text-slate-500 text-xs min-w-[100px]">
                  <div>{j.name}</div>
                  <div className="text-[10px] font-normal text-slate-400">{j.org}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_PROJECTS.map((proj) => (
              <tr key={proj.projectId} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 text-sm">{proj.name}</div>
                  <div className="text-xs text-slate-400">{proj.teamName}</div>
                </td>
                {MOCK_JUDGES.map((judge) => {
                  const isAssigned = (assignments[judge.judgeId] ?? []).includes(proj.projectId)
                  return (
                    <td key={judge.judgeId} className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(judge.judgeId, proj.projectId)}
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all',
                          isAssigned
                            ? 'bg-brand-blue text-white shadow-sm'
                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200',
                        )}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        {MOCK_JUDGES.map((judge) => {
          const count = (assignments[judge.judgeId] ?? []).length
          return (
            <div key={judge.judgeId} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{judge.name}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full font-bold',
                count >= 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500',
              )}>
                {count} 项
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Sub-tab: Progress ----
function ProgressTab() {
  const submitted = MOCK_SCORES.filter((s) => s.submitted).length
  const total = MOCK_SCORES.length
  const pct = Math.round((submitted / total) * 100)

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '参赛项目', value: MOCK_PROJECTS.length, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
          { label: '已提交评分', value: submitted, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '待提交', value: total - submitted, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="glass-card p-4 text-center space-y-1">
            <div className={cn('text-2xl font-black', color)}>{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>整体评分进度</span>
          <span>{submitted}/{total} 已提交</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-right text-slate-400">{pct}%</div>
      </div>

      {/* Matrix */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">项目</th>
              {MOCK_JUDGES.map((j) => (
                <th key={j.judgeId} className="px-4 py-3 text-center font-semibold text-slate-500 text-xs">{j.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_PROJECTS.map((proj) => (
              <tr key={proj.projectId} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">{proj.name}</td>
                {MOCK_JUDGES.map((judge) => {
                  const scoreCell = MOCK_SCORES.find(
                    (s) => s.projectId === proj.projectId && s.judgeId === judge.judgeId,
                  )
                  const assigned = (DEFAULT_ASSIGNMENTS[judge.judgeId] ?? []).includes(proj.projectId)
                  return (
                    <td key={judge.judgeId} className="px-4 py-3 text-center">
                      {!assigned ? (
                        <span className="text-slate-200 text-xs">—</span>
                      ) : scoreCell?.submitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> {scoreCell.score}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">待提交</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Sub-tab: Results ----
function ResultsTab() {
  type PromoteStatus = 'Promoted' | 'Eliminated' | 'Pending'
  const [computing, setComputing] = useState(false)
  const [computed, setComputed] = useState(true)
  const [promoteStatus, setPromoteStatus] = useState<Record<string, PromoteStatus>>({
    'proj-3': 'Promoted',
    'proj-5': 'Promoted',
    'proj-1': 'Pending',
    'proj-2': 'Pending',
    'proj-4': 'Pending',
  })

  const results = MOCK_PROJECTS
    .map((proj) => {
      const scores = MOCK_SCORES.filter((s) => s.projectId === proj.projectId && s.submitted)
      const avg = scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        : null
      return { ...proj, avg, scoreCount: scores.length, status: promoteStatus[proj.projectId] ?? 'Pending' as PromoteStatus }
    })
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .map((r, i) => ({ ...r, rank: i + 1 }))

  const handleCompute = async () => {
    setComputing(true)
    await new Promise((r) => setTimeout(r, 800))
    setComputing(false)
    setComputed(true)
  }

  const togglePromote = (projectId: string) => {
    setPromoteStatus((prev) => ({
      ...prev,
      [projectId]: prev[projectId] === 'Promoted' ? 'Eliminated' : 'Promoted',
    }))
  }

  const STATUS_BADGE: Record<PromoteStatus, string> = {
    Promoted:   'bg-emerald-50 text-emerald-700',
    Eliminated: 'bg-red-50 text-red-500',
    Pending:    'bg-slate-100 text-slate-400',
  }
  const STATUS_LABEL: Record<PromoteStatus, string> = {
    Promoted:   '晋级',
    Eliminated: '淘汰',
    Pending:    '待定',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">基于已提交评分自动计算均分与排名</p>
        <button onClick={handleCompute} disabled={computing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-60 transition-colors">
          <RefreshCw className={cn('w-3.5 h-3.5', computing && 'animate-spin')} />
          {computing ? '计算中…' : '重新计算成绩'}
        </button>
      </div>

      {computed && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs w-12">排名</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs">项目名称</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs">评分人数</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs">均分</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs">晋级状态</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.map((proj) => (
                <tr key={proj.projectId} className={cn(
                  'hover:bg-slate-50/50 transition-colors',
                  proj.status === 'Promoted' && 'bg-emerald-50/30',
                  proj.status === 'Eliminated' && 'bg-red-50/20',
                )}>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black',
                      proj.rank === 1 ? 'bg-amber-400 text-white' :
                      proj.rank === 2 ? 'bg-slate-300 text-white' :
                      proj.rank === 3 ? 'bg-amber-700/80 text-white' :
                      'bg-slate-100 text-slate-500',
                    )}>
                      {proj.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{proj.name}</div>
                    <div className="text-xs text-slate-400">{proj.teamName}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{proj.scoreCount}</td>
                  <td className="px-4 py-3 text-center">
                    {proj.avg != null ? (
                      <span className={cn(
                        'font-black text-base tabular-nums',
                        proj.avg >= 90 ? 'text-emerald-600' :
                        proj.avg >= 80 ? 'text-brand-blue' : 'text-orange-500',
                      )}>
                        {proj.avg.toFixed(1)}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', STATUS_BADGE[proj.status])}>
                      {STATUS_LABEL[proj.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePromote(proj.projectId)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        proj.status === 'Promoted'
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                      )}
                    >
                      {proj.status === 'Promoted' ? '取消晋级' : '确认晋级'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Main page ----
const TABS = [
  { key: 'assign',   label: '分配任务', icon: Users },
  { key: 'progress', label: '评审进度', icon: BarChart2 },
  { key: 'results',  label: '阶段成绩', icon: Award },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ReviewManagementPage({ stage }: { stage: ReviewStage }) {
  const { id: competitionId = '' } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('assign')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-slate-800">{STAGE_LABEL[stage]}管理</h1>
        <p className="text-sm text-slate-400 mt-0.5">分配评委任务、监控评审进度、查看阶段成绩</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === key
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'assign'   && <AssignmentTab competitionId={competitionId} />}
      {activeTab === 'progress' && <ProgressTab />}
      {activeTab === 'results'  && <ResultsTab />}
    </div>
  )
}
