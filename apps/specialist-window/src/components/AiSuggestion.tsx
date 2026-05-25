import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ScoreDimension } from '@bochuangyuan/types'

interface AiSuggestionProps {
  dimensions: Omit<ScoreDimension, 'weight'>[]
  summary: string
  confidence: number
}

export function AiSuggestion({ dimensions, summary, confidence }: AiSuggestionProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-violet-50/60"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-bold text-violet-700">AI 评分建议</span>
          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
            置信度 {confidence}%
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-violet-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3">
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            以下为 AI 建议，仅供参考，最终评分以您的判断为准
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
          <div className="space-y-2">
            {dimensions.map((d) => (
              <div key={d.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-bold text-violet-600">{d.score} 分</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
