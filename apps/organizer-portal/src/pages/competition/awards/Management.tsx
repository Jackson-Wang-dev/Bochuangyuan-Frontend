import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type AwardLevel = 'First' | 'Second' | 'Third' | 'Honorable'

// ---- types ----
interface AwardLevelConfig {
  level: AwardLevel
  label: string
  quota: number
  bonus: number
  color: string
}

interface ProjectItem {
  projectId: string
  name: string
  teamName: string
  avgScore: number
}

// ---- constants ----
const DEFAULT_LEVELS: AwardLevelConfig[] = [
  { level: 'First',    label: '一等奖', quota: 1, bonus: 50000, color: 'bg-amber-400' },
  { level: 'Second',   label: '二等奖', quota: 2, bonus: 20000, color: 'bg-slate-300' },
  { level: 'Third',    label: '三等奖', quota: 3, bonus: 10000, color: 'bg-amber-700/70' },
  { level: 'Honorable',label: '优秀奖', quota: 5, bonus: 2000,  color: 'bg-sky-200' },
]

const MOCK_PROMOTED_PROJECTS: ProjectItem[] = [
  { projectId: 'proj-3', name: '医疗影像 AI 辅助诊断', teamName: '健影团队',   avgScore: 90.0 },
  { projectId: 'proj-5', name: '区块链供应链溯源',     teamName: '链信科技',   avgScore: 95.0 },
  { projectId: 'proj-1', name: 'AI 分布式算力平台',    teamName: '算力先锋队', avgScore: 86.5 },
  { projectId: 'proj-2', name: '碳中和智能监测系统',   teamName: '绿能科技',   avgScore: 79.7 },
  { projectId: 'proj-4', name: '智慧农业物联网平台',   teamName: '田间智慧',   avgScore: 73.0 },
]

const LEVEL_ORDER: AwardLevel[] = ['First', 'Second', 'Third', 'Honorable']

export default function AwardsManagementPage() {
  const [levels, setLevels] = useState<AwardLevelConfig[]>(DEFAULT_LEVELS)
  const [winners, setWinners] = useState<Record<string, AwardLevel>>({
    'proj-5': 'First',
    'proj-3': 'Second',
    'proj-1': 'Second',
    'proj-2': 'Third',
  })
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [activeSection, setActiveSection] = useState<'levels' | 'assign'>('assign')

  const updateLevel = (idx: number, field: keyof AwardLevelConfig, value: string | number) => {
    setLevels((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const assignLevel = (projectId: string, level: AwardLevel | '') => {
    setWinners((prev) => {
      const next = { ...prev }
      if (level === '') delete next[projectId]
      else next[projectId] = level
      return next
    })
    setPublished(false)
  }

  const handlePublish = async () => {
    setPublishing(true)
    await new Promise((r) => setTimeout(r, 800))
    setPublishing(false)
    setPublished(true)
  }

  const LEVEL_BADGE: Record<AwardLevel, string> = {
    First:    'bg-amber-100 text-amber-700',
    Second:   'bg-slate-200 text-slate-600',
    Third:    'bg-amber-50 text-amber-800',
    Honorable:'bg-sky-50 text-sky-600',
  }
  const LEVEL_LABEL: Record<AwardLevel, string> = {
    First: '一等奖', Second: '二等奖', Third: '三等奖', Honorable: '优秀奖',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">获奖与奖项</h1>
          <p className="text-sm text-slate-400 mt-0.5">配置奖项级别、分配获奖项目、发布获奖名单</p>
        </div>
        <button onClick={handlePublish} disabled={publishing || published}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors',
            published ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:bg-brand-blue/90',
            (publishing || published) && 'opacity-80',
          )}>
          {published ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {publishing ? '发布中…' : published ? '已发布获奖名单' : '发布获奖名单'}
        </button>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['assign', 'levels'] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold transition-all',
              activeSection === s ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}>
            {s === 'assign' ? '分配获奖' : '奖项配置'}
          </button>
        ))}
      </div>

      {/* Section: Award Levels Config */}
      {activeSection === 'levels' && (
        <div className="space-y-3">
          {levels.map((lvl, i) => (
            <div key={lvl.level} className="glass-card p-4 flex items-center gap-4">
              <div className={cn('w-3 h-8 rounded-full flex-shrink-0', lvl.color)} />
              <div className="font-bold text-slate-800 w-16">{lvl.label}</div>
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-slate-500 whitespace-nowrap">名额</label>
                <input type="number" min={1} max={20} value={lvl.quota}
                  onChange={(e) => updateLevel(i, 'quota', Number(e.target.value))}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                <label className="text-xs text-slate-500 whitespace-nowrap ml-4">奖金 (元)</label>
                <input type="number" min={0} value={lvl.bonus}
                  onChange={(e) => updateLevel(i, 'bonus', Number(e.target.value))}
                  className="w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section: Assign Winners */}
      {activeSection === 'assign' && (
        <div className="space-y-3">
          {/* Award group summary */}
          <div className="grid grid-cols-4 gap-3">
            {DEFAULT_LEVELS.map((lvl) => {
              const count = Object.values(winners).filter((w) => w === lvl.level).length
              const quota = levels.find((l) => l.level === lvl.level)?.quota ?? lvl.quota
              return (
                <div key={lvl.level} className="glass-card p-3 text-center space-y-1">
                  <div className="text-lg font-black text-slate-800">{count}<span className="text-slate-300 font-normal text-sm">/{quota}</span></div>
                  <div className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', LEVEL_BADGE[lvl.level])}>
                    {LEVEL_LABEL[lvl.level]}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">项目名称</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">决赛均分</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">奖项分配</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_PROMOTED_PROJECTS.sort((a, b) => b.avgScore - a.avgScore).map((proj) => (
                  <tr key={proj.projectId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{proj.name}</div>
                      <div className="text-xs text-slate-400">{proj.teamName}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-brand-blue tabular-nums">
                      {proj.avgScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={winners[proj.projectId] ?? ''}
                        onChange={(e) => assignLevel(proj.projectId, e.target.value as AwardLevel | '')}
                        className={cn(
                          'border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors',
                          winners[proj.projectId]
                            ? `border-transparent ${LEVEL_BADGE[winners[proj.projectId]!]}`
                            : 'border-slate-200 text-slate-400 bg-white',
                        )}
                      >
                        <option value="">— 未获奖 —</option>
                        {LEVEL_ORDER.map((lvl) => (
                          <option key={lvl} value={lvl}>{LEVEL_LABEL[lvl]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
