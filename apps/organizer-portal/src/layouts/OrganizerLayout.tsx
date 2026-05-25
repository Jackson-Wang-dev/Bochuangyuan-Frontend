import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Trophy, Users, History, LogOut } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/competitions', icon: Trophy,   label: '赛事管理' },
  { to: '/staff',        icon: Users,    label: '员工管理' },
  { to: '/logs',         icon: History,  label: '操作日志' },
]

export function OrganizerLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-brand-blue text-white">
        <div className="flex items-center justify-between px-8 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-700 font-black text-sm italic">B</span>
            </div>
            <span className="font-bold text-base tracking-tight">博创园 · 主办方端</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user?.organization ?? '主办方'}</span>
            <span className="text-sm text-white/50">{user?.name ?? ''}</span>
            <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden px-8 gap-8 mt-8 max-w-[1600px] mx-auto w-full pb-6">
        {/* Sidebar */}
        <aside className="w-44 flex-shrink-0 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue border-r-4 border-brand-blue'
                    : 'text-slate-500 hover:bg-white/50',
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
