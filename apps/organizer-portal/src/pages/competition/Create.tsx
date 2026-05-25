import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { DimensionEditor } from '@/components/DimensionEditor'
import type { ScoreDimensionConfig } from '@bochuangyuan/types'

const DEFAULT_DIMS: ScoreDimensionConfig[] = [
  { key: 'technology', label: '技术成熟度', weight: 30, description: '' },
  { key: 'market',     label: '市场前景',   weight: 30, description: '' },
  { key: 'team',       label: '团队能力',   weight: 20, description: '' },
  { key: 'innovation', label: '创新性',     weight: 20, description: '' },
]

type Step = 1 | 2 | 3

export default function CreateCompetitionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({
    name: '',
    description: '',
    enrollDeadline: '',
    reviewDeadline: '',
  })
  const [dimensions, setDimensions] = useState<ScoreDimensionConfig[]>(DEFAULT_DIMS)

  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const canNext2 = form.name && form.enrollDeadline && form.reviewDeadline
  const canNext3 = totalWeight === 100 && dimensions.every((d) => d.label)

  const handlePublish = () => {
    // TODO: call createCompetition API
    navigate('/competitions')
  }

  const STEPS = ['基本信息', '评分维度', '预览确认']

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-800">新建赛事</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active ? 'bg-brand-blue text-white' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <span>{n}</span>}
                {label}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1" />}
            </div>
          )
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700">基本信息</h2>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">赛事名称 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="请输入赛事名称"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">赛事简介</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="请输入赛事简介"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">报名截止 *</label>
              <input
                type="date"
                value={form.enrollDeadline}
                onChange={(e) => setForm((f) => ({ ...f, enrollDeadline: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">评审截止 *</label>
              <input
                type="date"
                value={form.reviewDeadline}
                onChange={(e) => setForm((f) => ({ ...f, reviewDeadline: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canNext2}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-brand-blue/90 transition-colors"
            >
              下一步 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700">评分维度配置</h2>
          <DimensionEditor dimensions={dimensions} onChange={setDimensions} />
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 上一步
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canNext3}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-brand-blue/90 transition-colors"
            >
              下一步 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-700">预览确认</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">赛事名称</span>
                <span className="font-semibold text-slate-800">{form.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">报名截止</span>
                <span className="font-semibold text-slate-800">{form.enrollDeadline}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">评审截止</span>
                <span className="font-semibold text-slate-800">{form.reviewDeadline}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 block mb-2">评分维度</span>
                <div className="space-y-1">
                  {dimensions.map((d) => (
                    <div key={d.key} className="flex justify-between text-xs">
                      <span className="text-slate-600">{d.label}</span>
                      <span className="text-slate-400">权重 {d.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 上一步
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <Check className="w-4 h-4" /> 发布赛事
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
