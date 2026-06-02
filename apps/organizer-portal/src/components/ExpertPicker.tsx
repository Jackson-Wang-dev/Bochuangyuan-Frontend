import { Search, X } from 'lucide-react'
import { useState } from 'react'
import type { Judge } from '@bochuangyuan/types'

const PLATFORM_JUDGES: Judge[] = [
  { judgeId: 'j-1', name: '张志远', org: '清华大学', expertise: ['AI', '芯片'] },
  { judgeId: 'j-2', name: '李梅',   org: '北京大学', expertise: ['医疗', '生物'] },
  { judgeId: 'j-3', name: '王峰',   org: '字节跳动', expertise: ['互联网', '商业'] },
  { judgeId: 'j-4', name: '陈晓辉', org: '华为技术', expertise: ['通信', '硬件'] },
]

interface ExpertPickerProps {
  selected: Judge[]
  onSelect: (j: Judge) => void
  onDeselect: (id: string) => void
}

export function ExpertPicker({ selected, onSelect, onDeselect }: ExpertPickerProps) {
  const [query, setQuery] = useState('')
  const filtered = PLATFORM_JUDGES.filter(
    (j) => !query || j.name.includes(query) || (j.org ?? '').includes(query) || (j.expertise ?? []).some((d) => d.includes(query)),
  )

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">平台专家库</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索姓名、机构、领域..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <div className="space-y-2">
          {filtered.map((judge) => {
            const isSelected = selected.some((s) => s.judgeId === judge.judgeId)
            return (
              <div key={judge.judgeId} className="glass-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 text-brand-blue font-bold text-sm">
                  {judge.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{judge.name}</p>
                  <p className="text-xs text-slate-400">{judge.org} · {(judge.expertise ?? []).join('、')}</p>
                </div>
                <button
                  onClick={() => isSelected ? onDeselect(judge.judgeId) : onSelect(judge)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500'
                      : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'
                  }`}
                >
                  {isSelected ? '已选' : '选择'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">已选评委 ({selected.length})</h3>
        {selected.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">请从左侧选择评委</div>
        ) : (
          <div className="space-y-2">
            {selected.map((judge) => (
              <div key={judge.judgeId} className="glass-card p-3 flex items-center gap-3 border-emerald-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-sm">
                  {judge.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{judge.name}</p>
                  <p className="text-xs text-slate-400">{judge.org}</p>
                </div>
                <button onClick={() => onDeselect(judge.judgeId)} className="text-slate-300 hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
