import { ScoreMatrix, type ScoreRow } from '@/components/ScoreMatrix'

const MOCK_ENROLLMENTS: ScoreRow[] = [
  {
    enrollId: 'enr-2', projectName: '碳中和智能监测系统', finalScore: 84.75,
    scores: [
      { expertName: '张志远', finalScore: 87.5 },
      { expertName: '李梅',   finalScore: 82.0 },
    ],
  },
  {
    enrollId: 'enr-4', projectName: '智慧农业物联网平台', finalScore: 85.25,
    scores: [
      { expertName: '张志远', finalScore: 79.0 },
      { expertName: '李梅',   finalScore: 91.5 },
    ],
  },
]

export default function ScoreOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">评分汇总矩阵</h2>
        <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          导出 Excel
        </button>
      </div>
      <ScoreMatrix enrollments={MOCK_ENROLLMENTS} />
    </div>
  )
}
