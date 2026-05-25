import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'

export default function ProjectDetailPage() {
  const { enrollId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </button>

      <div className="glass-card p-5 space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-800">碳中和智能监测系统</h2>
          <StatusBadge status="scored" />
        </div>
        <p className="text-sm text-slate-400">报名编号：{enrollId} · 参赛者：李明</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">各评委评分</h3>
          {[
            { name: '张志远', score: 87.5, org: '清华大学' },
            { name: '李梅',   score: 82.0, org: '北京大学' },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                <p className="text-xs text-slate-400">{s.org}</p>
              </div>
              <span className="text-2xl font-black text-emerald-600">{s.score}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-slate-600">综合均分</span>
            <span className="text-3xl font-black text-brand-blue">84.75</span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-700">项目摘要</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            本项目通过物联网传感器网络实现对工业园区碳排放的实时监测与分析，结合 AI 模型提供碳减排建议，助力企业实现碳中和目标。
          </p>
        </div>
      </div>
    </div>
  )
}
