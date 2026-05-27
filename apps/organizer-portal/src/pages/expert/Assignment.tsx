import { useState } from 'react'
import { useExpertStore } from '@/store/expertStore'
import { Users, Shuffle } from 'lucide-react'
import type { Expert } from '@bochuangyuan/types'

// TODO: replace with API call to fetch competition enrollments for assignment (endpoint TBD)
const MOCK_PROJECTS = [
  { enrollId: 'enr-1', projectName: 'AI 分布式算力平台' },
  { enrollId: 'enr-2', projectName: '碳中和智能监测系统' },
  { enrollId: 'enr-3', projectName: '医疗影像 AI 辅助诊断' },
  { enrollId: 'enr-4', projectName: '智慧农业物联网平台' },
  { enrollId: 'enr-5', projectName: '区块链溯源平台' },
]

export default function AssignmentPage() {
  const { selectedExperts, assignments, assignEnrollments } = useExpertStore()
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(assignments.map((a) => [a.expertId, a.enrollIds])),
  )

  const autoAssign = () => {
    if (selectedExperts.length === 0) return
    const perExpert = Math.ceil(MOCK_PROJECTS.length / selectedExperts.length)
    const newAssign: Record<string, string[]> = {}
    selectedExperts.forEach((expert, i) => {
      newAssign[expert.expertId] = MOCK_PROJECTS
        .slice(i * perExpert, (i + 1) * perExpert)
        .map((p) => p.enrollId)
    })
    setSelected(newAssign)
  }

  const toggleAssign = (expertId: string, enrollId: string) => {
    setSelected((prev) => {
      const current = prev[expertId] ?? []
      const next = current.includes(enrollId)
        ? current.filter((id) => id !== enrollId)
        : [...current, enrollId]
      return { ...prev, [expertId]: next }
    })
  }

  const saveAll = () => {
    // TODO: call batch assignment API to persist assignments on server
    Object.entries(selected).forEach(([expertId, enrollIds]) => {
      assignEnrollments(expertId, enrollIds)
    })
  }

  const displayExperts: Expert[] = selectedExperts.length > 0
    ? selectedExperts
    : [{ expertId: 'e-1', name: '张志远', organization: '清华大学', domain: [], source: 'platform' }]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">评审任务分配</h2>
        <div className="flex gap-2">
          <button
            onClick={autoAssign}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Shuffle className="w-4 h-4" /> 均匀分配
          </button>
          <button
            onClick={saveAll}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            保存分配
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(displayExperts.length, 3)}, 1fr)` }}>
        {displayExperts.map((expert) => {
          const assigned = selected[expert.expertId] ?? []
          return (
            <div key={expert.expertId} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
                  {expert.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{expert.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />{assigned.length} 项
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {MOCK_PROJECTS.map((proj) => {
                  const isAssigned = assigned.includes(proj.enrollId)
                  return (
                    <button
                      key={proj.enrollId}
                      onClick={() => toggleAssign(expert.expertId, proj.enrollId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isAssigned
                          ? 'bg-brand-blue/10 text-brand-blue'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {isAssigned ? '✓ ' : ''}{proj.projectName}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
