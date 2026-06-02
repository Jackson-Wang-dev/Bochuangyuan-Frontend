import { NavLink, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Trophy, Scale, ClipboardList, Medal, Bell, Settings, LogOut,
  Search, ChevronDown,
} from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type NavItem = { to: string; label: string }
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] }

function buildGroups(competitionId: string | undefined): NavGroup[] {
  const cid = competitionId
  return [
    {
      label: '赛事管理',
      icon: Trophy,
      items: [
        { to: '/competitions', label: '赛事列表' },
        ...(cid ? [{ to: `/competitions/${cid}/judges`, label: '评委名册' }] : []),
      ],
    },
    ...(cid
      ? [
          {
            label: '报名与审核',
            icon: ClipboardList,
            items: [
              { to: `/competitions/${cid}/registrations`, label: '报名管理' },
              { to: `/competitions/${cid}/qualification`, label: '资质审核' },
              { to: `/competitions/${cid}/green-channel`, label: '绿色通道' },
            ],
          },
          {
            label: '评审管理',
            icon: Scale,
            items: [
              { to: `/competitions/${cid}/prelim`, label: '初审管理' },
              { to: `/competitions/${cid}/semifinal`, label: '复审管理' },
              { to: `/competitions/${cid}/final`, label: '终审/路演' },
            ],
          },
          {
            label: '成绩与结算',
            icon: Medal,
            items: [
              { to: `/competitions/${cid}/awards`, label: '获奖与奖项' },
              { to: `/competitions/${cid}/settlement`, label: '结算' },
            ],
          },
          {
            label: '运营',
            icon: Bell,
            items: [
              { to: `/competitions/${cid}/notifications`, label: '通知管理' },
              { to: `/competitions/${cid}/album`, label: '赛事相册' },
              { to: `/competitions/${cid}/schedule`, label: '赛程管理' },
            ],
          },
        ]
      : []),
    {
      label: '系统管理',
      icon: Settings,
      items: [
        { to: '/staff', label: '员工管理' },
        { to: '/logs', label: '操作日志' },
      ],
    },
  ]
}

function SidebarGroup({ group }: { group: NavGroup }) {
  const location = useLocation()
  const isAnyActive = group.items.some((item) => location.pathname.startsWith(item.to))
  const [open, setOpen] = useState(isAnyActive || group.label === '赛事管理')

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2.5 py-[6px] text-[11px] font-semibold tracking-widest uppercase text-faint hover:text-muted transition-colors"
      >
        <span className="flex items-center gap-2">
          <group.icon className="w-3.5 h-3.5" />
          {group.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mb-2">
          {group.items.map(({ to, label }) => {
            const active = location.pathname === to || (to !== '/competitions' && location.pathname.startsWith(to))
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'relative flex items-center gap-2 h-[36px] pl-[22px] pr-3 rounded-lg text-[13px] font-medium transition-colors mb-px',
                  active
                    ? 'bg-brand-50 text-brand-d font-semibold'
                    : 'text-muted hover:bg-[#F4F5F8] hover:text-ink',
                )}
              >
                {active && (
                  <span className="absolute -left-3 top-[6px] bottom-[6px] w-[3px] rounded-r-[3px] bg-brand" />
                )}
                {label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function OrganizerLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()
  const { id: competitionId } = useParams<{ id?: string }>()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const groups = buildGroups(competitionId)
  const orgName = (user as { organization?: string })?.organization ?? '主办方'
  const userName = (user as { name?: string })?.name ?? ''
  const initials = userName ? userName.slice(-1) : orgName.slice(0, 1)

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
            博创园<span className="text-muted font-medium"> · 主办方端</span>
          </b>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3.5">
          {groups.map((group) => (
            <SidebarGroup key={group.label} group={group} />
          ))}
        </nav>

        {/* Account */}
        <div className="border-t border-line p-3 flex items-center gap-2.5 flex-none">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#3a5bf0] to-[#2236a8] text-white grid place-items-center font-bold text-[14px] flex-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink leading-tight truncate">
              {userName || orgName}
            </div>
            <div className="text-[11.5px] text-faint">{orgName}</div>
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
            <span className="font-semibold text-ink">赛事管理</span>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-[#F4F5F8] border border-line rounded-lg px-3 py-[7px] w-60">
            <Search className="w-[15px] h-[15px] text-faint flex-none" />
            <input
              placeholder="搜索赛事 / 项目"
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
          <div className="max-w-[1280px] mx-auto px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
