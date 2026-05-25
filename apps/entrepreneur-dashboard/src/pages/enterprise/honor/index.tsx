export default function EnterpriseHonorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">荣誉资质</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + 添加荣誉
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <p className="text-sm text-slate-400">暂无荣誉资质，点击上方按钮添加</p>
      </div>
    </div>
  )
}
