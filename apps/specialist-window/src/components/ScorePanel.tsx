import { Save, Send } from 'lucide-react'
import type { ScoreDimension } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

interface ScorePanelProps {
  dimensions: ScoreDimension[]
  overallComment: string
  readonly?: boolean
  submitting?: boolean
  onDimensionChange: (key: string, score: number) => void
  onCommentChange: (text: string) => void
  onSaveDraft: () => void
  onSubmit: () => void
}

export function ScorePanel({
  dimensions,
  overallComment,
  readonly = false,
  submitting = false,
  onDimensionChange,
  onCommentChange,
  onSaveDraft,
  onSubmit,
}: ScorePanelProps) {
  const weightedScore = dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)

  return (
    <div className="space-y-4">
      {/* Weighted total preview */}
      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">加权总分预览</span>
        <span className={cn(
          'text-3xl font-black tabular-nums',
          weightedScore >= 80 ? 'text-emerald-600' : weightedScore >= 60 ? 'text-brand-blue' : 'text-orange-500',
        )}>
          {weightedScore.toFixed(1)}
        </span>
      </div>

      {/* Dimensions */}
      <div className="glass-card p-4 space-y-5">
        <h3 className="text-sm font-bold text-slate-700">各维度评分</h3>
        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">{dim.label}</span>
                <span className="text-xs text-slate-400">权重 {dim.weight}%</span>
              </div>
              <span className={cn(
                'text-xl font-black tabular-nums',
                dim.score >= 80 ? 'text-emerald-600' : dim.score >= 60 ? 'text-brand-blue' : 'text-orange-500',
              )}>
                {dim.score}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={dim.score}
              disabled={readonly}
              onChange={(e) => onDimensionChange(dim.key, Number(e.target.value))}
              className="w-full h-2 rounded-full accent-brand-blue disabled:opacity-50 cursor-pointer disabled:cursor-default"
            />
          </div>
        ))}
      </div>

      {/* Overall comment */}
      <div className="glass-card p-4 space-y-2">
        <label className="text-sm font-bold text-slate-700">综合意见</label>
        <textarea
          value={overallComment}
          disabled={readonly}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="请填写您的综合评审意见..."
          rows={4}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none disabled:bg-slate-50"
        />
      </div>

      {/* Actions */}
      {!readonly && (
        <div className="flex gap-3">
          <button
            onClick={onSaveDraft}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            暂存草稿
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? '提交中...' : '提交评分'}
          </button>
        </div>
      )}
    </div>
  )
}
