export default function AiAssessmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI 创业能力评估</h2>
        <p className="text-sm text-slate-400 mt-0.5">多维度智能分析您的创业综合能力</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">能力雷达图</h3>
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl">
            RadarChart 组件（待接入）
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm">AI 分析报告</h3>
          <div className="space-y-3">
            {['技术洞察', '市场直觉', '领导力', '风险意识', '创新能级'].map((dim) => (
              <div key={dim} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16 flex-shrink-0">{dim}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.random() * 50 + 40}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            开始评估
          </button>
        </div>
      </div>
    </div>
  )
}
