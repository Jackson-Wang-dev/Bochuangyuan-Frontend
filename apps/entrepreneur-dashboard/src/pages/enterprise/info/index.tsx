export default function EnterpriseInfoPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">企业基础信息</h2>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        {['企业名称', '统一社会信用代码', '法定代表人', '注册资本', '成立时间', '注册地址'].map((field) => (
          <div key={field}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field}</label>
            <input
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`请输入${field}`}
            />
          </div>
        ))}
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          保存
        </button>
      </div>
    </div>
  )
}
