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
  FileText,
} from 'lucide-react'
import { AiAssistant } from '@/components/ai-assistant'
import { GlobalFilePicker } from '@/components/file-picker/GlobalFilePicker'
import { cn } from '../lib/utils'

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

const NAV_ITEMS = [
  { to: '/home',             icon: LayoutDashboard, label: '首页' },
  { to: '/profile',          icon: User,            label: '个人档案' },
  { to: '/project',          icon: Briefcase,       label: '项目管理' },
  { to: '/project/bp',       icon: FileText,        label: '在线编辑BP' },
  { to: '/enterprise/info',  icon: Building2,       label: '企业档案' },
  { to: '/materials',        icon: FolderOpen,      label: '材料库' },
  { to: '/competition',      icon: Trophy,          label: '大赛入口' },
  { to: '/ai-assessment',    icon: Sparkles,        label: 'AI 评估' },
] as const

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/project'}
      onMouseEnter={() => PREFETCH[to]?.()}
      className={({ isActive }) =>
        cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all',
          isActive
            ? 'bg-brand-blue/10 text-brand-blue border-r-4 border-brand-blue'
            : 'text-slate-500 hover:bg-white/50',
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
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

export function DashboardLayout() {
  const navigate = useNavigate()

  return (
    // h-screen + overflow-hidden = App Shell: header+sidebar never move,
    // only the inner content area scrolls. No outer scrollbar = no width jumps.
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex flex-col">
      <NavProgress />

      {/* Header */}
      <div className="flex-shrink-0 bg-brand-blue">
        <nav className="flex items-center justify-between p-4 px-8 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border border-white/20">
              <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black italic text-xl tracking-tighter">B</span>
              </div>
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">博创网</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-brand-blue" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <img
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop"
                className="w-8 h-8 rounded-xl border-2 border-white/20 cursor-pointer hover:scale-105 transition-all"
                alt="用户头像"
                onClick={() => navigate('/auth')}
              />
              <ChevronDown className="w-4 h-4 text-white/40 cursor-pointer" onClick={() => navigate('/auth')} />
            </div>
          </div>
        </nav>
      </div>

      {/* Body: sidebar + content, fills remaining height */}
      <div className="flex flex-1 overflow-hidden px-8 gap-8 mt-12 max-w-[1800px] mx-auto w-full pb-6">
        {/* Sidebar scrolls independently if nav items overflow */}
        <aside className="w-48 flex-shrink-0 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
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
