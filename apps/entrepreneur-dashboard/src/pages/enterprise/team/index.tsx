export default function EnterpriseTeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">团队成员</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + 添加成员
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-2xl border border-slate-100 border-dashed p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-white hover:border-blue-200 transition-colors">
          <span className="text-3xl mb-2">+</span>
          <p className="text-sm">添加团队成员</p>
        </div>
      </div>
    </div>
  )
}
