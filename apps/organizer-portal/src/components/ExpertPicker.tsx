import { Search, Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { Expert } from '@bochuangyuan/types'

// TODO: replace with API call to fetch platform expert pool (endpoint TBD)
const PLATFORM_EXPERTS: Expert[] = [
  { expertId: 'e-1', name: '张志远', organization: '清华大学', domain: ['AI', '芯片'], source: 'platform' },
  { expertId: 'e-2', name: '李梅',   organization: '北京大学', domain: ['医疗', '生物'],  source: 'platform' },
  { expertId: 'e-3', name: '王峰',   organization: '字节跳动', domain: ['互联网', '商业'], source: 'platform' },
  { expertId: 'e-4', name: '陈晓辉', organization: '华为技术', domain: ['通信', '硬件'],  source: 'platform' },
]

interface ExpertPickerProps {
  selected: Expert[]
  onSelect: (e: Expert) => void
  onDeselect: (id: string) => void
}

export function ExpertPicker({ selected, onSelect, onDeselect }: ExpertPickerProps) {
  const [query, setQuery] = useState('')
  const filtered = PLATFORM_EXPERTS.filter(
    (e) => !query || e.name.includes(query) || e.organization.includes(query) || e.domain.some((d) => d.includes(query)),
  )

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Left: platform pool */}
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
          {filtered.map((expert) => {
            const isSelected = selected.some((s) => s.expertId === expert.expertId)
            return (
              <div key={expert.expertId} className="glass-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 text-brand-blue font-bold text-sm">
                  {expert.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{expert.name}</p>
                  <p className="text-xs text-slate-400">{expert.organization} · {expert.domain.join('、')}</p>
                </div>
                <button
                  onClick={() => isSelected ? onDeselect(expert.expertId) : onSelect(expert)}
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

      {/* Right: selected */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">已选评委 ({selected.length})</h3>
        {selected.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">请从左侧选择评委</div>
        ) : (
          <div className="space-y-2">
            {selected.map((expert) => (
              <div key={expert.expertId} className="glass-card p-3 flex items-center gap-3 border-emerald-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-sm">
                  {expert.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{expert.name}</p>
                  <p className="text-xs text-slate-400">{expert.organization}</p>
                </div>
                <button onClick={() => onDeselect(expert.expertId)} className="text-slate-300 hover:text-rose-400 transition-colors">
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
