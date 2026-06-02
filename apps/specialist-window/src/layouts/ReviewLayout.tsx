import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, ClipboardList, Bell, LogOut, Search } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/competitions',  icon: Trophy,        label: '我的赛事',  badge: 3 },
  { to: '/review/queue',  icon: ClipboardList, label: '全部任务',  badge: 9 },
  { to: '/notifications', icon: Bell,          label: '消息通知',  badge: 2, badgeRed: true },
]

function SidebarNav() {
  const location = useLocation()
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3.5">
      <p className="px-2.5 mb-2 text-[11px] font-semibold tracking-widest uppercase text-faint">
        评审工作台
      </p>
      {NAV_ITEMS.map(({ to, icon: Icon, label, badge, badgeRed }) => {
        const active = location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'relative flex items-center gap-[11px] h-[38px] px-[11px] rounded-lg mb-0.5 font-medium transition-colors',
              active
                ? 'bg-brand-50 text-brand-d font-semibold'
                : 'text-muted hover:bg-[#F4F5F8] hover:text-ink',
            )}
          >
            {active && (
              <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-[3px] bg-brand" />
            )}
            <Icon className="w-[17px] h-[17px] flex-none" />
            <span className="flex-1 text-[13.5px]">{label}</span>
            {badge != null && (
              <span
                className={cn(
                  'text-[11px] font-semibold px-[7px] py-px rounded-full min-w-[20px] text-center',
                  active
                    ? 'bg-brand text-white'
                    : badgeRed
                    ? 'bg-[#FDECEC] text-[#D14343]'
                    : 'bg-slate-bg text-slate',
                )}
              >
                {badge}
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function ReviewLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name ? user.name.slice(-1) : '评'

  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: '248px 1fr' }}>
      {/* Sidebar */}
      <aside className="flex flex-col bg-panel border-r border-line">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-[18px] border-b border-line flex-none">
          <div className="w-7 h-7 rounded-[7px] bg-brand text-white grid place-items-center font-extrabold text-[15px] shadow-sm">
            B
          </div>
          <b className="text-[15px] font-bold tracking-tight text-ink">
            博创园<span className="text-muted font-medium"> · 评委端</span>
          </b>
        </div>

        <SidebarNav />

        {/* Account */}
        <div className="border-t border-line p-3 flex items-center gap-2.5 flex-none">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#3a5bf0] to-[#2236a8] text-white grid place-items-center font-bold text-[14px] flex-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink leading-tight truncate">
              {user?.name ?? '评委'}
            </div>
            <div className="text-[11.5px] text-faint">初审 / 复审专家</div>
          </div>
          <button
            onClick={handleLogout}
            title="退出登录"
            className="w-[30px] h-[30px] rounded-[7px] grid place-items-center text-faint hover:bg-[#F4F5F8] hover:text-ink transition-colors flex-none"
          >
            <LogOut className="w-[17px] h-[17px]" />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex-none bg-panel border-b border-line flex items-center px-[22px] gap-3.5">
          <nav className="flex items-center gap-2 text-[13px] text-muted">
            <span className="font-semibold text-ink">赛事列表</span>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-[#F4F5F8] border border-line rounded-lg px-3 py-[7px] w-60">
            <Search className="w-[15px] h-[15px] text-faint flex-none" />
            <input
              placeholder="搜索项目 / 编号"
              className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-faint w-full"
            />
          </div>
          <button className="relative w-[34px] h-[34px] rounded-lg grid place-items-center text-muted hover:bg-[#F4F5F8] hover:text-ink transition-colors border border-transparent">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-[7px] right-[8px] w-[7px] h-[7px] rounded-full bg-[#E5484D] border-2 border-panel" />
          </button>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-page">
          <div className="max-w-[1080px] mx-auto px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
