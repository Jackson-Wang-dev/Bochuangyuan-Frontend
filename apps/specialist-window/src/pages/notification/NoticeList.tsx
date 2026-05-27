import { Bell, CheckCircle } from 'lucide-react'

// TODO: replace with API call to fetch notifications (endpoint TBD)
const MOCK_NOTICES = [
  {
    id: 'n-1',
    title: '您已被添加为评委',
    body: '您已被添加为"2024 全国大学生创业大赛"的评委，请查看待评审列表。',
    time: '2024-06-01 10:00',
    read: false,
  },
  {
    id: 'n-2',
    title: '新评审任务分配',
    body: '赛事主办方为您分配了 3 个待评审项目，截止时间为 2024-06-30。',
    time: '2024-06-01 10:05',
    read: true,
  },
]

export default function NoticeListPage() {
  return (
    <div className="space-y-3 pb-20 md:pb-0">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">消息通知</h2>

      {MOCK_NOTICES.map((notice) => (
        <div key={notice.id} className={`glass-card p-4 flex gap-3 ${!notice.read ? 'border-brand-blue/20 bg-blue-50/30' : ''}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!notice.read ? 'bg-brand-blue/10' : 'bg-slate-100'}`}>
            {notice.read
              ? <CheckCircle className="w-4 h-4 text-slate-400" />
              : <Bell className="w-4 h-4 text-brand-blue" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-sm font-bold ${notice.read ? 'text-slate-600' : 'text-slate-800'}`}>
                {notice.title}
              </span>
              {!notice.read && <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0 mt-1.5" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notice.body}</p>
            <p className="text-xs text-slate-400 mt-1.5">{notice.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
