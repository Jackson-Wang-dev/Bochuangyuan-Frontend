import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  ExternalLink,
  FileCheck2,
  Globe2,
  KeyRound,
  Landmark,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MapPin,
  Newspaper,
  Network,
  Phone,
  Radar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { getDashboardUrl, hasDashboardUrl } from './lib/dashboard'
import { formatCountdown, formatShortDate } from './lib/competition'
import { useSiteAuth } from './store/siteAuth'
import type { HeroStat, SiteCompetition, SiteFeature, SiteNavItem, SiteNewsArticle, SitePartner } from './types'

const iconMap: Record<string, LucideIcon> = {
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  Landmark,
  LineChart,
  Newspaper,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
}

export function BochuangLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#0045c4" />
      <path
        d="M12 10h10.4c4.6 0 7.5 2.3 7.5 6 0 2.1-1 3.7-2.8 4.7 2.4.9 3.7 2.7 3.7 5.3 0 4.1-3.2 6.7-8.2 6.7H12V10Zm6.1 5v4h3.6c1.4 0 2.2-.7 2.2-2s-.8-2-2.2-2h-3.6Zm0 8.6v4.1h4.2c1.5 0 2.4-.8 2.4-2.1 0-1.3-.9-2-2.4-2h-4.2Z"
        fill="white"
      />
    </svg>
  )
}

export function SiteHeader({ navItems }: { navItems: SiteNavItem[] }) {
  const { user, accessToken, isLoginOpen, isLoggingIn, loginError, openLogin, closeLogin, logout, login } = useSiteAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [openNavIndex, setOpenNavIndex] = useState<number | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${isScrolled ? 'border-slate-200 bg-white/[0.97] shadow-lg shadow-slate-200/50' : 'border-transparent bg-white/80'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-slate-950 transition-opacity hover:opacity-80" onClick={() => setIsMobileNavOpen(false)}>
            <BochuangLogo />
            <div>
              <div className="text-base font-bold tracking-tight">博创网</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Doctor Venture</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpenNavIndex(null)}>
            {navItems.map((item, index) => (
              <div key={item.href} className="relative" onMouseEnter={() => setOpenNavIndex(item.groups ? index : null)}>
                <a href={item.href} className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950">
                  {item.label}
                </a>
                {item.groups && openNavIndex === index && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3 animate-[fade-in_0.2s_ease-out]">
                    <div className="flex gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" style={{ minWidth: item.groups.length > 1 ? 480 : 280 }}>
                      {item.groups.map((group) => (
                        <div key={group.title} className="min-w-[200px]">
                          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">{group.title}</div>
                          <div className="mt-3 space-y-3">
                            {group.items.map((groupItem) => (
                              <Link
                                key={groupItem.href + groupItem.label}
                                to={groupItem.href}
                                className="block rounded-xl px-2 py-1.5 -mx-2 transition-colors duration-150 hover:bg-slate-50"
                                onClick={() => setOpenNavIndex(null)}
                              >
                                <div className="text-sm font-medium text-slate-900">{groupItem.label}</div>
                                {groupItem.desc && <div className="mt-0.5 text-xs leading-5 text-slate-500">{groupItem.desc}</div>}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={openLogin} className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950">
              入口
            </button>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-100"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white">{user.username.slice(0, 1).toUpperCase()}</span>
                  {user.username}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-xl animate-[fade-in_0.15s_ease-out]">
                    <div className="px-3 py-2 text-xs text-slate-400">{user.role}账号</div>
                    <a href={getDashboardUrl('', accessToken)} className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-slate-50">
                      <User className="h-4 w-4 text-brand-blue" /> 进入工作台
                    </a>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors duration-150 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4 text-slate-400" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openLogin} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-blue/20 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-md hover:shadow-brand-blue/25">
                登录 <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label={isMobileNavOpen ? '关闭导航' : '打开导航'}
            aria-expanded={isMobileNavOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileNavOpen && (
          <div className="border-t border-slate-200 bg-white shadow-xl lg:hidden">
            <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl overflow-y-auto px-4 py-4">
              <nav className="space-y-2" aria-label="移动端导航">
                {navItems.map((item) => (
                  <div key={item.href} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2">
                    <a
                      href={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className="flex min-h-11 items-center rounded-xl px-3 text-base font-semibold text-slate-950"
                    >
                      {item.label}
                    </a>
                    {item.groups && (
                      <div className="mt-1 space-y-3 px-3 pb-2">
                        {item.groups.map((group) => (
                          <div key={group.title}>
                            <div className="pt-2 font-mono text-[11px] font-semibold uppercase text-brand-blue">{group.title}</div>
                            <div className="mt-2 grid gap-2">
                              {group.items.map((groupItem) => (
                                <Link
                                  key={groupItem.href + groupItem.label}
                                  to={groupItem.href}
                                  onClick={() => setIsMobileNavOpen(false)}
                                  className="block rounded-xl bg-white px-3 py-3 text-left shadow-sm"
                                >
                                  <div className="text-sm font-medium text-slate-900">{groupItem.label}</div>
                                  {groupItem.desc && <div className="mt-1 text-xs leading-5 text-slate-500">{groupItem.desc}</div>}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
      <LoginModal isOpen={isLoginOpen} isLoggingIn={isLoggingIn} error={loginError} onClose={closeLogin} onLogin={login} />
    </>
  )
}
export function LoginModal({
  isOpen,
  isLoggingIn,
  error,
  onClose,
  onLogin,
}: {
  isOpen: boolean
  isLoggingIn: boolean
  error: string | null
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<void>
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [tab, setTab] = useState<'password' | 'phone' | 'wechat'>('password')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setUsername('')
      setPassword('')
      setPhone('')
      setCode('')
      setTab('password')
    }
  }, [isOpen])

  function handleClose() {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250)
  }

  if (!isOpen && !isClosing) return null

  const animState = isClosing
    ? 'animate-[fade-in-scale_0.25s_ease-in_reverse_both] opacity-0 scale-95'
    : 'animate-[fade-in-scale_0.35s_cubic-bezier(0.16,1,0.3,1)_both]'

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 pt-[12vh] pb-8 ${isClosing ? 'animate-[fade-in_0.2s_ease-in_reverse_both] opacity-0' : 'animate-[fade-in_0.25s_ease-out]'}`} style={{ pointerEvents: isClosing ? 'none' : 'auto' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 z-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Card */}
      <div className={`relative z-10 flex w-full max-w-[720px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/25 ${animState}`}>
        {/* Left decorative panel */}
        <div className="hidden w-[280px] shrink-0 flex-col justify-between hero-ink p-8 sm:flex">
          <div>
            <BochuangLogo className="h-10 w-10" />
            <h3 className="mt-6 text-xl font-semibold text-white">博创网</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              登录后可报名赛事、管理项目，<br />进入创业者工作台。
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-brand-cyan" />
              <span className="text-sm text-white/70">一键报名参赛</span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-cyan" />
              <span className="text-sm text-white/70">项目数据看板</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-brand-cyan" />
              <span className="text-sm text-white/70">资源与政策对接</span>
            </div>
          </div>
        </div>

        {/* Right form area */}
        <div className="flex flex-1 flex-col">
          {/* Close button */}
          <div className="flex items-center justify-end px-5 pt-4">
            <button onClick={handleClose} aria-label="关闭" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile logo (visible when left panel hidden) */}
          <div className="flex items-center gap-2 px-6 sm:hidden">
            <BochuangLogo className="h-7 w-7" />
            <span className="text-sm font-semibold text-slate-950">博创网</span>
          </div>

          {/* Tabs */}
          <div className="mt-2 flex items-center gap-1 px-6">
            {([
              { key: 'password' as const, label: '账号密码' },
              { key: 'phone' as const, label: '手机验证码' },
              { key: 'wechat' as const, label: '微信登录' },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-brand-blue/8 text-brand-blue'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 px-6 pt-5 pb-6">
            {/* Password login */}
            {tab === 'password' && (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void onLogin(username, password)
                }}
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">账号</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="请输入用户名"
                      required
                      autoComplete="username"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">密码</label>
                    <a href="#" className="text-xs text-brand-blue hover:underline">忘记密码?</a>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="请输入密码"
                      type="password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10"
                    />
                  </div>
                </div>
                {error && (
                  <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-xl hover:shadow-brand-blue/25 disabled:opacity-60"
                >
                  {isLoggingIn ? '登录中…' : '登录'}
                </button>
              </form>
            )}

            {/* Phone login */}
            {tab === 'phone' && (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                }}
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">手机号</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="请输入手机号"
                      type="tel"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">验证码</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="请输入验证码"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10"
                      />
                    </div>
                    <button type="button" className="shrink-0 rounded-xl border border-brand-blue/30 px-4 py-3 text-sm font-medium text-brand-blue transition-all duration-200 hover:bg-brand-blue/8">
                      获取验证码
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-xl hover:shadow-brand-blue/25"
                >
                  登录
                </button>
              </form>
            )}

            {/* WeChat login */}
            {tab === 'wechat' && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <svg viewBox="0 0 48 48" className="h-12 w-12 text-green-500" fill="currentColor">
                    <path d="M18.5 11c-5.5 0-10 3.8-10 8.5 0 2.7 1.5 5.1 3.8 6.7l-1 3 3.5-1.8c1.1.3 2.3.5 3.5.5.3 0 .7 0 1-.1-.6-1-1-2.2-1-3.5 0-4.7 4-8.5 9-8.5s9 3.8 9 8.5-4 8.5-9 8.5c-1.2 0-2.3-.2-3.4-.5l-3.3 1.7.9-2.8c-2.2-1.5-3.6-3.8-3.6-6.3 0-4.7 4-8.5 9-8.5z"/>
                  </svg>
                </div>
                <p className="mt-4 text-sm text-slate-500">请使用微信扫描二维码登录</p>
                <p className="mt-1 text-xs text-slate-400">（微信登录功能即将上线）</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-6 py-3 text-center">
            <p className="text-xs text-slate-400">
              登录即表示同意
              <Link to="/news" className="text-brand-blue hover:underline">服务条款</Link>
              和
              <Link to="/news" className="text-brand-blue hover:underline">隐私政策</Link>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function SiteFooter() {
  const publicLinks = [
    { label: '赛事信息', to: '/competitions' },
    { label: '新闻资讯', to: '/news' },
    { label: '政策动态', to: '/news' },
    { label: '联系我们', to: '/#about' },
  ]
  const aboutLinks = [
    { label: '关于博创网', to: '/news' },
    { label: '联系方式', to: '/news' },
    { label: '加入我们', to: '/news' },
    { label: '常见问题', to: '/news' },
  ]

  return (
    <footer id="about" className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1.15fr] lg:gap-10">
        <div className="rounded-3xl bg-brand-paper p-5 sm:rounded-none sm:bg-transparent sm:p-0">
          <div className="flex items-center gap-3">
            <BochuangLogo className="h-12 w-12 sm:h-9 sm:w-9" />
            <div>
              <div className="text-lg font-semibold text-slate-950 sm:text-base">博创网</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Doctor Venture</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-8 text-slate-500 sm:max-w-xs sm:leading-7">
            博创网连接博士后人才、企业需求、园区载体与创新创业赛事，持续服务项目从发现到成长。
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-none sm:border-0 sm:p-0 sm:shadow-none">
          <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue">公开信息</h4>
          <div className="mt-4 flex flex-wrap gap-2 sm:block sm:space-y-3">
            {publicLinks.map((link) => (
              <Link key={link.label} to={link.to} className="rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-600 transition-colors duration-200 hover:text-brand-blue sm:block sm:bg-transparent sm:px-0 sm:py-0">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-none sm:border-0 sm:p-0 sm:shadow-none">
          <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue">关于我们</h4>
          <div className="mt-4 flex flex-wrap gap-2 sm:block sm:space-y-3">
            {aboutLinks.map((link) => (
              <Link key={link.label} to={link.to} className="rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-600 transition-colors duration-200 hover:text-brand-blue sm:block sm:bg-transparent sm:px-0 sm:py-0">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-brand-ink p-5 text-white shadow-lg shadow-slate-950/10 sm:rounded-none sm:bg-transparent sm:p-0 sm:text-slate-600 sm:shadow-none">
          <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-cyan sm:text-brand-blue">联系方式</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-brand-cyan sm:text-brand-blue" /> contact@bochuang.com</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-brand-cyan sm:text-brand-blue" /> 010-8888-6666</li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan sm:text-brand-blue" /> 北京市海淀区中关村科技园区</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:mt-12 sm:flex-row sm:items-center sm:pt-6">
        <span>&copy; 2026 博创网 Doctor Venture. All rights reserved.</span>
        <div className="flex flex-wrap gap-4">
          <Link to="/news" className="transition-colors duration-200 hover:text-slate-600">隐私政策</Link>
          <Link to="/news" className="transition-colors duration-200 hover:text-slate-600">服务条款</Link>
          <span>京ICP备20260001号</span>
        </div>
      </div>
    </footer>
  )
}
export function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-left sm:text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{desc}</p>
    </div>
  )
}

export function FeatureCard({ item }: { item: SiteFeature }) {
  const Icon = iconMap[item.icon] ?? Sparkles
  return (
    <article className="group relative flex min-h-[210px] min-w-[82vw] snap-start flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-lift sm:min-h-0 sm:min-w-0 sm:flex-row sm:gap-4">
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-brand-cyan/8 sm:hidden" />
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-sm shadow-brand-blue/20 transition-colors duration-200 group-hover:bg-brand-blue-2 sm:h-11 sm:w-11 sm:rounded-xl sm:bg-brand-blue/8 sm:text-brand-blue sm:shadow-none sm:group-hover:bg-brand-blue/12">
        <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      </div>
      <div className="relative mt-5 sm:mt-0">
        <h3 className="text-lg font-semibold leading-snug text-slate-950 transition-colors duration-200 group-hover:text-brand-blue">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:mt-2">{item.desc}</p>
      </div>
    </article>
  )
}
export function StatCard({ stat, accent = 'cyan', animateBars = false }: { stat: HeroStat; accent?: 'cyan' | 'blue'; animateBars?: boolean }) {
  const max = Math.max(...stat.trend, 1)
  const barColor = accent === 'cyan' ? 'bg-brand-cyan' : 'bg-brand-blue'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="font-mono text-2xl font-semibold tabular-nums text-white">{stat.value}</div>
      <div className="mt-1 text-xs text-white/52">{stat.label}</div>
      <div className="mt-3 flex h-8 items-end gap-1">
        {stat.trend.map((point, index) => (
          <span
            key={index}
            className={`flex-1 rounded-sm ${barColor} ${animateBars ? 'bar-animated' : ''}`}
            style={{
              height: `${Math.max((point / max) * 100, 8)}%`,
              opacity: 0.45 + (index / stat.trend.length) * 0.55,
              animationDelay: animateBars ? `${index * 60}ms` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function PartnersStrip({ partners }: { partners: SitePartner[] }) {
  return (
    <div className="mobile-snap-row flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
      {partners.map((partner) => (
        <div
          key={partner.name}
          className="group flex min-w-[38vw] snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm card-lift sm:min-w-0 sm:rounded-xl sm:px-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all duration-200 group-hover:bg-brand-blue/8 group-hover:text-brand-blue sm:h-10 sm:w-10 sm:rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold leading-snug text-slate-700 transition-colors duration-200 group-hover:text-brand-blue">{partner.name}</span>
          <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-400">{partner.tag}</span>
        </div>
      ))}
    </div>
  )
}
export function CompetitionCard({ item }: { item: SiteCompetition }) {
  const countdown = formatCountdown(item.deadline)
  const { user, accessToken, openLogin } = useSiteAuth()
  const dashboardConfigured = hasDashboardUrl()
  const registerHref = user && dashboardConfigured ? getDashboardUrl(`/competition/${item.slug}/register`, accessToken) : undefined
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm card-lift">
      <div className="relative h-32 w-full overflow-hidden bg-slate-100 sm:h-44">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-white/92 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">{item.status}</span>
          </span>
          {countdown && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-ink/85 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
              <Clock className="h-3 w-3" /> {countdown}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg font-semibold leading-snug text-slate-950 transition-colors duration-200 group-hover:text-brand-blue sm:text-xl">{item.name}</h3>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 mobile-snap-row sm:flex-wrap sm:overflow-visible sm:pb-0">
          <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{item.category}</span>
          {item.tracks.slice(0, 3).map((track) => <span key={track} className="shrink-0 rounded-lg bg-brand-cyan/10 px-2.5 py-1 text-xs text-brand-cyan">{track}</span>)}
          {item.tags.slice(0, 1).map((tag) => <span key={tag} className="shrink-0 rounded-lg bg-brand-blue/8 px-2.5 py-1 text-xs text-brand-blue">{tag}</span>)}
        </div>
        <p className="mt-3 line-clamp-1 text-sm leading-6 text-slate-600 sm:line-clamp-none">{item.trackDescription}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 text-sm sm:mt-5 sm:gap-3">
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 text-slate-600 sm:bg-transparent sm:px-0 sm:py-0"><MapPin className="h-3.5 w-3.5 shrink-0 text-brand-blue" /> <span className="truncate">{item.location}</span></div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 text-slate-600 sm:bg-transparent sm:px-0 sm:py-0"><CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-blue" /> <span className="truncate">截止 {item.deadline}</span></div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 text-slate-600 sm:bg-transparent sm:px-0 sm:py-0"><Trophy className="h-3.5 w-3.5 shrink-0 text-brand-blue" /> <span className="truncate">{item.reward}{item.rewardUnit}</span></div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 text-slate-600 sm:bg-transparent sm:px-0 sm:py-0"><Users className="h-3.5 w-3.5 shrink-0 text-brand-blue" /> <span className="truncate">规模 {item.metric}</span></div>
        </div>
        <div className="mt-4 flex gap-2 sm:mt-5">
          <Link
            to={`/competitions/${item.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand-blue hover:text-brand-blue sm:font-medium sm:py-2.5"
          >
            查看详情
          </Link>
          {registerHref ? (
            <a
              href={registerHref}
              className="hidden flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-blue-2 sm:inline-flex"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </a>
          ) : user ? (
            <button
              disabled
              title="创业者工作台地址未配置，暂不可跳转报名"
              className="hidden flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400 sm:inline-flex"
            >
              报名赛事
            </button>
          ) : (
            <button
              onClick={openLogin}
              className="hidden flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-blue-2 sm:inline-flex"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
function useDragNavigation({
  count,
  activeIndex,
  goTo,
  onDragStateChange,
}: {
  count: number
  activeIndex: number
  goTo: (index: number) => void
  onDragStateChange?: (isDragging: boolean) => void
}) {
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  function resetDrag() {
    startXRef.current = null
    startYRef.current = null
    setDragOffset(0)
    setIsDragging(false)
    onDragStateChange?.(false)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' || count <= 1) return
    startXRef.current = event.clientX
    startYRef.current = event.clientY
    setIsDragging(true)
    onDragStateChange?.(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (startXRef.current === null || startYRef.current === null) return
    const deltaX = event.clientX - startXRef.current
    const deltaY = event.clientY - startYRef.current
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const atStart = activeIndex === 0 && deltaX > 0
    const atEnd = activeIndex === count - 1 && deltaX < 0
    setDragOffset(atStart || atEnd ? deltaX * 0.28 : deltaX)
  }

  function onPointerUp() {
    if (startXRef.current === null) return
    const offset = dragOffset
    const threshold = 56
    resetDrag()
    if (Math.abs(offset) < threshold) return
    goTo(offset < 0 ? activeIndex + 1 : activeIndex - 1)
  }

  return {
    dragOffset,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: resetDrag,
    },
  }
}
function computePerView(): number {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 640) return 2
  return 1
}

function usePerView(): number {
  const [perView, setPerView] = useState(computePerView)

  useEffect(() => {
    function onResize() {
      setPerView(computePerView())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return perView
}

export function CompetitionCarousel({ items }: { items: SiteCompetition[] }) {
  const perView = usePerView()
  const pages = useMemo(() => {
    const chunks: SiteCompetition[][] = []
    for (let i = 0; i < items.length; i += perView) chunks.push(items.slice(i, i + perView))
    return chunks
  }, [items, perView])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (activeIndex >= pages.length) setActiveIndex(0)
  }, [pages.length, activeIndex])

  useEffect(() => {
    if (isPaused || pages.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % pages.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [isPaused, pages.length])

  function goTo(index: number) {
    setActiveIndex(((index % pages.length) + pages.length) % pages.length)
  }

  const drag = useDragNavigation({
    count: pages.length,
    activeIndex,
    goTo,
    onDragStateChange: setIsPaused,
  })

  return (
    <div
      data-horizontal-swipe
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...drag.handlers}
    >
      <div className="touch-pan-y overflow-hidden rounded-2xl">
        <div className={`flex ${drag.isDragging ? "" : "transition-transform duration-700 ease-out"}`} style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${drag.dragOffset}px))` }}>
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="grid w-full flex-shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.map((item) => <CompetitionCard key={item.slug} item={item} />)}
            </div>
          ))}
        </div>
      </div>
      {pages.length > 1 && (
        <>
          <button
            aria-label="上一个"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition-all duration-200 hover:text-brand-blue hover:shadow-lg sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="下一个"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition-all duration-200 hover:text-brand-blue hover:shadow-lg sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-5 flex items-center justify-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                aria-label={`查看第 ${index + 1} 组`}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-6 bg-brand-blue' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function StatHighlightCard({ stat }: { stat: HeroStat }) {
  const max = Math.max(...stat.trend, 1)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm card-lift">
      <div className="font-mono text-2xl font-semibold tabular-nums text-slate-950">{stat.value}</div>
      <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
      <div className="mt-3 flex h-8 items-end gap-1">
        {stat.trend.map((point, index) => (
          <span
            key={index}
            className="flex-1 rounded-sm bg-brand-blue"
            style={{ height: `${Math.max((point / max) * 100, 8)}%`, opacity: 0.25 + (index / stat.trend.length) * 0.6 }}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroCompetitionCard({ item }: { item: SiteCompetition }) {
  const { user, accessToken, openLogin } = useSiteAuth()
  const dashboardConfigured = hasDashboardUrl()
  const registerHref = user && dashboardConfigured ? getDashboardUrl(`/competition/${item.slug}/register`, accessToken) : undefined
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-white shadow-2xl shadow-black/30 transition-shadow duration-300 hover:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)] sm:rounded-3xl">
      <div className="relative h-36 w-full overflow-hidden bg-slate-100 sm:h-48">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <span className="absolute left-3 top-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-lg bg-white/92 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span className="truncate">{item.status}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <h3 className="text-lg font-semibold leading-snug text-slate-950 transition-colors duration-200 group-hover:text-brand-blue sm:text-xl">{item.name}</h3>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs text-slate-500 mobile-snap-row sm:flex-wrap sm:overflow-visible sm:pb-0 sm:text-sm">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1"><CalendarDays className="h-3.5 w-3.5 text-brand-blue" /> {item.time}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1"><MapPin className="h-3.5 w-3.5 text-brand-blue" /> {item.location}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{item.summary}</p>
        <div className="mt-auto flex gap-2 pt-4 sm:pt-5">
          <Link
            to={`/competitions/${item.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand-blue hover:text-brand-blue sm:font-medium sm:py-2.5"
          >
            查看详情
          </Link>
          {registerHref ? (
            <a
              href={registerHref}
              className="hidden flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-blue-2 sm:inline-flex"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <button
              onClick={openLogin}
              className="hidden flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-blue-2 sm:inline-flex"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
export function HeroCompetitionCarousel({ items }: { items: SiteCompetition[] }) {
  const total = items.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (isPaused || reducedMotion || total <= 1) return
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % total), 4000)
    return () => window.clearInterval(timer)
  }, [isPaused, reducedMotion, total])

  function goTo(index: number) {
    setActiveIndex(((index % total) + total) % total)
  }

  const drag = useDragNavigation({
    count: total,
    activeIndex,
    goTo,
    onDragStateChange: setIsPaused,
  })

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(activeIndex - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(activeIndex + 1)
    }
  }

  if (total === 0) return null

  return (
    <div
      data-horizontal-swipe
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="近期大赛轮播"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...drag.handlers}
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.slug}>
            <Link to={`/competitions/${item.slug}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
      <div className="touch-pan-y overflow-hidden rounded-2xl sm:rounded-3xl" aria-hidden="true">
        <div
          className={`flex ${drag.isDragging || reducedMotion ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${drag.dragOffset}px))` }}
        >
          {items.map((item) => (
            <div key={item.slug} className="w-full flex-shrink-0">
              <HeroCompetitionCard item={item} />
            </div>
          ))}
        </div>
      </div>
      {total > 1 && (
        <>
          <button
            aria-label="上一个大赛"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur transition-all duration-200 hover:bg-white/20 sm:-left-2 sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="下一个大赛"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur transition-all duration-200 hover:bg-white/20 sm:-right-2 sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="relative z-30 mt-4 flex items-center justify-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                aria-label={`查看第 ${index + 1} 个大赛，共 ${total} 个`}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-6 bg-brand-cyan' : 'w-1.5 bg-white/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
export function NewsCard({ item }: { item: SiteNewsArticle }) {
  return (
    <article className="group min-w-[82vw] snap-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-brand-blue/30 hover:shadow-md md:grid md:min-w-0 md:grid-cols-[120px_minmax(0,1fr)_96px] md:items-center md:gap-5 md:border-0 md:px-1 md:py-4 md:shadow-none md:hover:bg-slate-50 md:hover:shadow-none">
      <div className="flex items-center justify-between gap-3 md:block">
        <span className="w-fit rounded-lg bg-brand-blue/8 px-2.5 py-1 text-xs font-medium text-brand-blue transition-colors duration-200 group-hover:bg-brand-blue/12">{item.type}</span>
        <span className="font-mono text-xs text-slate-400 md:hidden">{formatShortDate(item.date)}</span>
      </div>
      <div className="mt-4 min-w-0 md:mt-0">
        <Link to={`/news/${item.slug}`} className="text-base font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-brand-blue md:font-medium">
          {item.title}
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 md:mt-1 md:line-clamp-none">{item.summary}</p>
      </div>
      <span className="hidden font-mono text-sm text-slate-400 md:block md:text-right">{formatShortDate(item.date)}</span>
    </article>
  )
}
export function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  )
}

/* ── Button System ─────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20 hover:bg-brand-blue-2 hover:shadow-md hover:shadow-brand-blue/25',
  secondary: 'border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white',
  ghost: 'text-brand-blue hover:bg-brand-blue/8',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
}

const sizeClass: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3.5 py-2 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl',
}

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  [key: string]: unknown
}

export function Btn({ variant = 'primary', size = 'md', children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ── Skeleton Components ─────────────────────────────── */
export function SkeletonCompetitionCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <div className="skeleton h-6 w-3/4" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
        </div>
        <div className="mt-2 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-22" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </article>
  )
}

export function SkeletonFeatureCard() {
  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </article>
  )
}

export function SkeletonNewsCard() {
  return (
    <article className="grid gap-3 px-1 py-3 md:grid-cols-[120px_1fr_80px] md:items-center">
      <div className="skeleton h-6 w-20 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-full" />
      </div>
      <div className="skeleton h-4 w-16 justify-self-end" />
    </article>
  )
}

/* ── Skip to Content ──────────────────────────────────── */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-brand-blue focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
    >
      跳转到主要内容
    </a>
  )
}
