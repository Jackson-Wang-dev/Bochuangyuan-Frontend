export default function EnterpriseProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">产品信息</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + 添加产品
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <p className="text-sm text-slate-400">暂无产品信息</p>
      </div>
    </div>
  )
}
