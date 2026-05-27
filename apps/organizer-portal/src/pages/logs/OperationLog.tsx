import { History } from 'lucide-react'
import type { OperationLog } from '@bochuangyuan/types'

// TODO: replace with API call to fetch operation logs (endpoint TBD)
const MOCK_LOGS: OperationLog[] = [
  { logId: 'log-1', operatorId: 'org-001', operatorName: '管理员', action: '发布赛事', targetType: 'competition', targetId: 'comp-1', detail: '发布赛事"2024 全国大学生创业大赛"', createdAt: '2024-01-15 10:00:00' },
  { logId: 'log-2', operatorId: 'org-001', operatorName: '管理员', action: '分配评委', targetType: 'assignment', targetId: 'assign-1', detail: '为赛事分配 2 位评委', createdAt: '2024-06-01 14:30:00' },
  { logId: 'log-3', operatorId: 'org-001', operatorName: '管理员', action: '更新维度', targetType: 'competition', targetId: 'comp-1', detail: '更新评分维度配置', createdAt: '2024-06-02 09:15:00' },
]

export default function OperationLogPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-slate-800">操作日志</h1>

      <div className="glass-card divide-y divide-slate-50">
        {MOCK_LOGS.map((log) => (
          <div key={log.logId} className="flex items-start gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <History className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-700">{log.action}</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{log.operatorName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{log.detail}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{log.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
