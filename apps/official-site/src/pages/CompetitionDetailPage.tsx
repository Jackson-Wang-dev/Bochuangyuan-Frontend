import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  LogIn,
  MapPin,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getCompetitionDetail } from '../api/site'
import { DetailPanel, SiteFooter, SiteHeader } from '../components'
import { ScrollReveal } from '../components/ScrollReveal'
import { useInView } from '../hooks'
import { mockHomeData } from '../data/mockSiteData'
import { getDashboardUrl, hasDashboardUrl } from '../lib/dashboard'
import { useSiteAuth } from '../store/siteAuth'
import type { CompetitionDetail as CompetitionDetailType, CompetitionTimelineItem } from '../types'

/* ── Timeline ─────────────────────────────────────────── */
function TimelineItem({ milestone, index }: { milestone: CompetitionTimelineItem; index: number }) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className="relative flex gap-4"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={`flex h-3 w-3 shrink-0 rounded-full border-2 border-brand-blue bg-white ${isInView ? 'timeline-dot-animated' : 'opacity-0'}`}
          style={{ animationDelay: `${index * 120}ms` }}
        />
        <div className="w-px flex-1 bg-brand-blue/15 mt-1" />
      </div>
      <div className={`${isInView ? 'animate-[fade-in-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]' : 'opacity-0'}`} style={{ animationDelay: `${index * 120 + 80}ms` }}>
        <div className="text-sm font-semibold text-slate-950">{milestone.title}</div>
        <div className="mt-1 font-mono text-xs text-slate-400">{milestone.date}</div>
        <p className="mt-2 text-sm leading-7 text-slate-600 pb-6">{milestone.detail}</p>
      </div>
    </div>
  )
}

/* ── Hero Info Card ───────────────────────────────────── */
function HeroInfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-5 py-4 text-center backdrop-blur">
      {icon}
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

export function CompetitionDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<CompetitionDetailType | null>(null)
  const { user, accessToken, openLogin } = useSiteAuth()

  useEffect(() => {
    if (!slug) return
    let alive = true
    void getCompetitionDetail(slug).then((next) => alive && setItem(next))
    return () => { alive = false }
  }, [slug])

  if (!slug) return <Navigate to="/competitions" replace />

  const registerHref = user && hasDashboardUrl() ? getDashboardUrl(`/competition/${slug}/register`, accessToken) : undefined

  return (
    <main id="main-content" className="min-h-screen bg-brand-paper text-slate-900 page-enter">
      <SiteHeader navItems={mockHomeData.navItems} />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero-ink relative overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <Link to="/" className="transition-colors hover:text-white/70">首页</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/competitions" className="transition-colors hover:text-white/70">赛事列表</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">{item?.name ?? '加载中'}</span>
          </nav>

          {/* Eyebrow */}
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-cyan">
            {item?.category ?? '赛事详情'}
          </p>

          {/* Title */}
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            {item?.name ?? '赛事详情'}
          </h1>

          {/* Summary */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            {item?.summary ?? '正在加载赛事信息。'}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {registerHref ? (
              <a
                href={registerHref}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-xl hover:shadow-brand-blue/30"
              >
                立即报名 <ArrowRight className="h-4 w-4" />
              </a>
            ) : user ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-6 py-3 text-sm text-white/50">
                工作台未配置
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-xl hover:shadow-brand-blue/30"
              >
                登录后报名 <LogIn className="h-4 w-4" />
              </button>
            )}
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-all duration-200 hover:bg-white/15">
              分享赛事 <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Info Cards Grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroInfoCard
              icon={<CalendarDays className="h-5 w-5 text-brand-cyan" />}
              label="报名截止"
              value={item?.deadline ?? '-'}
            />
            <HeroInfoCard
              icon={<DollarSign className="h-5 w-5 text-brand-cyan" />}
              label="奖金总额"
              value={`${item?.reward ?? '-'}${item?.rewardUnit ?? ''}`}
            />
            <HeroInfoCard
              icon={<Target className="h-5 w-5 text-brand-cyan" />}
              label="重点方向"
              value={item?.tracks[0] ?? '-'}
            />
            <HeroInfoCard
              icon={<MapPin className="h-5 w-5 text-brand-cyan" />}
              label="举办地点"
              value={item?.location ?? '-'}
            />
          </div>
        </div>
      </section>

      {/* ── Body Content ──────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Tags */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">{item?.category ?? '-'}</span>
              {(item?.tracks ?? []).map((track) => (
                <span key={track} className="rounded-full bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan">{track}</span>
              ))}
              {(item?.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full bg-brand-blue/8 px-3 py-1.5 text-xs font-medium text-brand-blue">{tag}</span>
              ))}
            </div>
          </ScrollReveal>

          {/* Intro - 长文段落 */}
          <ScrollReveal>
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-slate-950">大赛介绍</h2>
              <div className="mt-4 space-y-5 text-base leading-8 text-slate-600">
                {(item?.intro ?? '加载中。').split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Quote / Highlight Block */}
          {(item?.objective) && (
            <ScrollReveal delay={80}>
              <blockquote className="mt-8 border-l-4 border-brand-blue bg-brand-blue/4 py-5 pl-6 pr-5 rounded-r-xl">
                <p className="text-base leading-8 text-slate-700 italic">
                  {item.objective}
                </p>
              </blockquote>
            </ScrollReveal>
          )}

          {/* Eligibility */}
          {(item?.eligibility?.length ?? 0) > 0 && (
            <ScrollReveal delay={120}>
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-950">参赛条件</h2>
                <ul className="mt-5 space-y-3">
                  {(item?.eligibility ?? []).map((rule) => (
                    <li key={rule} className="flex items-start gap-3 text-base leading-7 text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          )}

          {/* Materials */}
          {(item?.materials?.length ?? 0) > 0 && (
            <ScrollReveal delay={160}>
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-950">材料清单</h2>
                <ul className="mt-5 space-y-3">
                  {(item?.materials ?? []).map((mat) => (
                    <li key={mat} className="flex items-start gap-3 text-base leading-7 text-slate-600">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                      {mat}
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          )}

          {/* Timeline */}
          {(item?.milestones?.length ?? 0) > 0 && (
            <ScrollReveal delay={200}>
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-950">赛事进程</h2>
                <div className="mt-5">
                  {[...(item?.milestones ?? [])]
                    .sort((a, b) => a.order - b.order)
                    .map((milestone, index) => (
                      <TimelineItem key={milestone.order} milestone={milestone} index={index} />
                    ))}
                </div>
              </section>
            </ScrollReveal>
          )}

          {/* Services */}
          {(item?.services?.length ?? 0) > 0 && (
            <ScrollReveal delay={240}>
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-950">赛事服务</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(item?.services ?? []).map((svc) => (
                    <div key={svc} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-blue" />
                      <span className="text-sm text-slate-700">{svc}</span>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )}

          {/* Bottom CTA */}
          <ScrollReveal delay={300}>
            <div className="mt-14 rounded-2xl border border-brand-blue/20 bg-brand-ink p-8 text-center">
              <h3 className="text-xl font-semibold text-white">准备好参赛了吗？</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/60">
                报名将跳转至创业者工作台，复用您的项目资料完成赛事报名。
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {registerHref ? (
                  <a
                    href={registerHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-blue-2"
                  >
                    立即报名 <ArrowRight className="h-4 w-4" />
                  </a>
                ) : !user ? (
                  <button
                    onClick={openLogin}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-blue-2"
                  >
                    登录后报名 <LogIn className="h-4 w-4" />
                  </button>
                ) : null}
                <Link
                  to="/competitions"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/15"
                >
                  返回赛事列表
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
