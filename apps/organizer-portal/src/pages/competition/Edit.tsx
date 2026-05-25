import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { DimensionEditor } from '@/components/DimensionEditor'
import type { ScoreDimensionConfig } from '@bochuangyuan/types'

const DEFAULT_DIMS: ScoreDimensionConfig[] = [
  { key: 'technology', label: '技术成熟度', weight: 30 },
  { key: 'market',     label: '市场前景',   weight: 30 },
  { key: 'team',       label: '团队能力',   weight: 20 },
  { key: 'innovation', label: '创新性',     weight: 20 },
]

export default function EditCompetitionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('2024 全国大学生创业大赛')
  const [description, setDescription] = useState('面向全国高校在校生及应届生的创业竞赛')
  const [dimensions, setDimensions] = useState<ScoreDimensionConfig[]>(DEFAULT_DIMS)

  const handleSave = () => {
    // TODO: call updateCompetition API
    navigate(`/competitions/${id}`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-800">编辑赛事</h1>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600">赛事名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600">赛事简介</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-700">评分维度配置</h2>
        <DimensionEditor dimensions={dimensions} onChange={setDimensions} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Save className="w-4 h-4" /> 保存更改
        </button>
      </div>
    </div>
  )
}
