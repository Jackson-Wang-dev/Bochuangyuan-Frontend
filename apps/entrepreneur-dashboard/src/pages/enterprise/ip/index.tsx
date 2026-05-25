export default function EnterpriseIpPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">专利 / 软著</h2>
          <p className="text-sm text-slate-400 mt-0.5">知识产权管理，用于智能匹配大赛</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + 添加知识产权
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['专利', '软件著作权', '商标', '其他'].map((type) => (
          <div key={type} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
            <p className="font-semibold text-slate-700 text-sm">{type}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">0</p>
          </div>
        ))}
      </div>
    </div>
  )
}
