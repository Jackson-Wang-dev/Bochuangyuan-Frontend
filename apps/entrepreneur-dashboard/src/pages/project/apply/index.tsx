import { useParams } from 'react-router-dom'

export default function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">一键报名</h2>
        <p className="text-sm text-slate-400 mt-0.5">项目 {id} · 赛事报名流程</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['选择版本', '补充材料', '确认提交'].map((step, i) => (
          <div key={step} className={`rounded-2xl p-6 border ${i === 0 ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {i + 1}
            </div>
            <p className="font-semibold text-slate-700 text-sm">{step}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm">选择报名版本</h3>
        <p className="text-sm text-slate-400">选择要提交到大赛的项目版本（提交后该版本将锁定）</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          确认报名
        </button>
      </div>
    </div>
  )
}
