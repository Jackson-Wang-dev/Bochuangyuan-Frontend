import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClipboardList, CheckSquare, Bell, LogOut } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/review/queue',     icon: ClipboardList, label: '待评审' },
  { to: '/review/completed', icon: CheckSquare,   label: '已完成' },
  { to: '/notifications',    icon: Bell,          label: '消息通知' },
]

export function ReviewLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-brand-blue text-white flex-shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-700 font-black text-sm italic">B</span>
            </div>
            <span className="font-bold text-base tracking-tight">博创园 · 评委端</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user?.name ?? '评委'}</span>
            <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 gap-6 py-6">
        {/* Sidebar — hidden on mobile, shown md+ */}
        <aside className="hidden md:flex w-44 flex-col gap-1 flex-shrink-0">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-slate-500 hover:bg-white hover:text-slate-700',
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors',
                isActive ? 'text-brand-blue' : 'text-slate-400',
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
