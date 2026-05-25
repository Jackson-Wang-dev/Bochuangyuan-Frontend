import { useParams } from 'react-router-dom'

export default function ProjectVersionPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">版本管理</h2>
        <p className="text-sm text-slate-400 mt-0.5">项目 {id} · AI 版本对比</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">所有版本</h3>
        <div className="space-y-3">
          {['v3 - 草稿', 'v2 - 已提交', 'v1 - 已锁定'].map((version) => (
            <div key={version} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">{version}</span>
              <button className="text-xs text-blue-600 font-semibold hover:underline">查看 AI 对比</button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">AI 版本对比</h3>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl">
          VersionDiff 组件（待接入）
        </div>
      </div>
    </div>
  )
}
