import { useLocation, useNavigation, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  FolderOpen,
  Trophy,
  Sparkles,
  User,
  Bell,
  ChevronDown,
  Search,
  HelpCircle,
  Globe,
  ClipboardList,
  TrendingUp,
  Medal,
} from 'lucide-react'
import { AiAssistant } from '@/components/ai-assistant'
import { GlobalFilePicker } from '@/components/file-picker/GlobalFilePicker'
import { cn } from '../lib/utils'
import { useState } from 'react'

const PREFETCH: Record<string, () => Promise<unknown>> = {
  '/home':               () => import('@/pages/home'),
  '/profile':            () => import('@/pages/profile'),
  '/project':            () => import('@/pages/project/list'),
  '/project/bp':         () => import('@/pages/project/editor'),
  '/enterprise/info':    () => import('@/pages/enterprise/info'),
  '/enterprise/honor':   () => import('@/pages/enterprise/honor'),
  '/enterprise/ip':      () => import('@/pages/enterprise/ip'),
  '/enterprise/product': () => import('@/pages/enterprise/product'),
  '/enterprise/team':    () => import('@/pages/enterprise/team'),
  '/materials':          () => import('@/pages/material-library'),
  '/competition':        () => import('@/pages/competition'),
  '/ai-assessment':      () => import('@/pages/ai-assessment'),
}

const COMPETITION_SUB_ITEMS = [
  { to: '/competition',               icon: Globe,          label: '赛事广场' },
  { to: '/competition/registrations', icon: ClipboardList,  label: '我的报名' },
  { to: '/competition/progress',      icon: TrendingUp,     label: '比赛进展' },
  { to: '/competition/results',       icon: Medal,          label: '结果与领奖' },
]

const FLAT_NAV_ITEMS = [
  { to: '/home',             icon: LayoutDashboard, label: '首页' },
  { to: '/profile',          icon: User,            label: '个人档案' },
  { to: '/project',          icon: Briefcase,       label: '项目管理' },
  { to: '/enterprise/info',  icon: Building2,       label: '企业档案' },
  { to: '/materials',        icon: FolderOpen,      label: '材料库' },
  { to: '/ai-assessment',    icon: Sparkles,        label: 'AI 评估' },
] as const

function NavItem({ to, icon: Icon, label, end }: { to: string; icon: React.ElementType; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end ?? to === '/project'}
      onMouseEnter={() => PREFETCH[to]?.()}
      className={({ isActive }) =>
        cn(
          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
          isActive
            ? 'bg-[#0045c4]/8 text-brand-blue'
            : 'text-slate-500 hover:bg-white/50',
        )
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </NavLink>
  )
}

function CompetitionNavGroup() {
  const location = useLocation()
  const isInCompetition = location.pathname.startsWith('/competition')
  const [open, setOpen] = useState(isInCompetition)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
          isInCompetition ? 'text-brand-blue' : 'text-slate-500 hover:bg-white/50',
        )}
      >
        <Trophy className="w-4 h-4" />
        <span className="flex-1 text-left">赛事</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="ml-3 pl-3 border-l border-slate-200 space-y-0.5 mt-0.5">
          {COMPETITION_SUB_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/competition'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  isActive ? 'bg-[#0045c4]/8 text-brand-blue' : 'text-slate-500 hover:bg-white/50',
                )
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function NavProgress() {
  const { state } = useNavigation()
  const isLoading = state === 'loading'
  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-0.5 z-[9999] pointer-events-none',
        isLoading ? 'opacity-100' : 'opacity-0 transition-opacity duration-300',
      )}
    >
      <motion.div
        className="h-full bg-brand-blue"
        initial={{ width: '0%' }}
        animate={isLoading ? { width: '80%' } : { width: '100%' }}
        transition={isLoading
          ? { duration: 2, ease: 'easeOut' }
          : { duration: 0.15, ease: 'easeIn' }
        }
      />
    </div>
  )
}

// Content area is position:absolute inset-0 inside a position:relative
// container — completely decoupled from document flow, so page content
// size differences never cause layout shifts in the surrounding grid.
function AnimatedContent() {
  const location = useLocation()
  return (
    <AnimatePresence>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ willChange: 'opacity' }}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-sm border border-slate-100"
      >
        <div className="p-8">
          <Outlet />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Geometric "B" SVG mark — 36×36 display, brand-blue tile + white glyph
function BochuangMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0045c4" />
      <path
        d="M11 9 H23 C27.4 9 30 11.6 30 15.4 C30 17.8 28.8 19.8 26.9 20.6 C29.4 21.4 31 23.6 31 26.4 C31 30.4 28 33 23.4 33 H11 V9 Z M16 13 V19 H22 C23.8 19 25 17.8 25 16 C25 14.2 23.8 13 22 13 H16 Z M16 23 V29 H23 C25 29 26 27.6 26 26 C26 24.2 24.9 23 23 23 H16 Z"
        fill="white"
      />
    </svg>
  )
}

export function DashboardLayout() {
  const navigate = useNavigate()

  return (
    // h-screen + overflow-hidden = App Shell: header+sidebar never move,
    // only the inner content area scrolls. No outer scrollbar = no width jumps.
    <div className="h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#f6f7fb' }}>
      <NavProgress />

      {/* Header — brand-ink with brand-blue radial glow + dotted texture */}
      <div className="flex-shrink-0 header-ink">
        <nav className="flex items-center justify-between py-3 px-8 text-white w-full relative">
          {/* Left: logo + bilingual lockup + product switcher */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <BochuangMark size={36} />
              <div className="leading-tight">
                <div className="text-base font-bold tracking-tight">博创网</div>
                <div className="text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
                  Bochuang · Doctor venture
                </div>
              </div>
            </div>

            {/* Product-level switcher */}
            <div className="hidden md:flex items-center gap-1 ml-2 text-xs">
              <button className="px-3 py-1.5 rounded-full bg-white/10 text-white font-medium">
                创业者工作台
              </button>
              <button
                className="px-3 py-1.5 rounded-full text-white/60 font-medium hover:text-white transition-colors"
                onClick={() => {}}
              >
                官网
              </button>
              <button
                className="px-3 py-1.5 rounded-full text-white/60 font-medium hover:text-white transition-colors"
                onClick={() => navigate('/competition')}
              >
                大赛入口
              </button>
            </div>
          </div>

          {/* Right: search + bell + help + user block */}
          <div className="flex items-center gap-2">
            {/* Global ⌘K search affordance */}
            <div className="hidden md:flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-full px-3.5 py-2 text-xs text-white/70 w-72 cursor-pointer hover:bg-white/[0.12] transition-colors">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">搜索项目、材料、大赛…</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-white/5">
                ⌘ K
              </span>
            </div>

            {/* Bell */}
            <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full ring-2 ring-brand-ink" />
            </button>

            {/* Help */}
            <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User block */}
            <div
              className="flex items-center gap-2 pl-3 ml-1 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/auth')}
            >
              <img
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop"
                className="w-7 h-7 rounded-full border border-white/20"
                alt="用户头像"
              />
              <div className="text-xs leading-tight hidden md:block">
                <div className="font-medium">陈博士</div>
                <div className="text-white/50 text-[10px]">高级合伙人</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-0.5" />
            </div>
          </div>
        </nav>
      </div>

      {/* Body: sidebar + content, fills remaining height */}
      <div className="flex flex-1 overflow-hidden px-8 gap-8 mt-8 max-w-[1800px] mx-auto w-full pb-6">
        {/* Sidebar scrolls independently if nav items overflow */}
        <aside className="w-44 flex-shrink-0 space-y-0.5 overflow-y-auto">
          {FLAT_NAV_ITEMS.slice(0, 4).map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <CompetitionNavGroup />
          {FLAT_NAV_ITEMS.slice(4).map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </aside>

        {/* Content shell: stable size, content absolutely positioned inside */}
        <div className="flex-1 relative">
          <AnimatedContent />
        </div>
      </div>

      <AiAssistant />
      <GlobalFilePicker />
    </div>
  )
}
