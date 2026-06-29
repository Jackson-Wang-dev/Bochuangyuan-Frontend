import { ArrowRight, CalendarDays, CheckCircle2, LogIn, MapPin, Share2, Sparkles, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getCompetitionDetail } from '../api/site'
import { DetailPanel, SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import { getDashboardUrl, hasDashboardUrl } from '../lib/dashboard'
import { useSiteAuth } from '../store/siteAuth'
import type { CompetitionDetail as CompetitionDetailType } from '../types'

export function CompetitionDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<CompetitionDetailType | null>(null)
  const { user, accessToken, openLogin } = useSiteAuth()

  useEffect(() => {
    if (!slug) return
    let alive = true
    void getCompetitionDetail(slug).then((next) => alive && setItem(next))
    return () => {
      alive = false
    }
  }, [slug])

  if (!slug) return <Navigate to="/competitions" replace />

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">赛事详情</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{item?.name ?? '赛事详情'}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{item?.summary ?? '正在加载赛事信息。'}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><CalendarDays className="h-4 w-4" /> 截止 {item?.deadline ?? '-'}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><MapPin className="h-4 w-4" /> {item?.location ?? '-'}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><Trophy className="h-4 w-4" /> 奖励 {item?.reward ?? '-'}{item?.rewardUnit ?? ''}</span>
          </div>
        </div>
      </section>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <DetailPanel title="赛事概览">{item?.intro ?? '加载中。'}</DetailPanel>
            <DetailPanel title="赛事目标">{item?.objective ?? '加载中。'}</DetailPanel>
            <DetailPanel title="参赛条件">
              <ul className="space-y-2">
                {(item?.eligibility ?? []).map((rule) => <li key={rule} className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-brand-blue" />{rule}</li>)}
              </ul>
            </DetailPanel>
            <DetailPanel title="材料清单">
              <ul className="space-y-2">
                {(item?.materials ?? []).map((mat) => <li key={mat} className="flex items-start gap-2"><Sparkles className="mt-1 h-4 w-4 text-brand-blue" />{mat}</li>)}
              </ul>
            </DetailPanel>
          </div>
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">时间线</h3>
              <div className="mt-5 space-y-4">
                {(item?.milestones ?? []).map((milestone) => (
                  <div key={milestone.title} className="border-l-2 border-brand-blue/20 pl-4">
                    <div className="text-sm font-semibold text-slate-950">{milestone.title}</div>
                    <div className="mt-1 font-mono text-xs text-slate-400">{milestone.date}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{milestone.detail}</p>
                  </div>
                ))}
              </div>
            </section>
            <DetailPanel title="赛事服务">
              <div className="space-y-2">
                {(item?.services ?? []).map((svc) => <div key={svc} className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-brand-blue" />{svc}</div>)}
              </div>
            </DetailPanel>
            <section className="rounded-2xl border border-slate-200 bg-brand-ink p-6 text-white shadow-sm">
              <div className="font-mono text-sm uppercase tracking-[0.2em] text-white/50">接口预留</div>
              <p className="mt-3 text-sm leading-7 text-white/68">列表与详情页都已通过 slug 请求数据，后端上线后可直接替换模拟内容。</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/competitions" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:bg-white/95">
                  返回列表 <ArrowRight className="h-4 w-4 text-brand-blue" />
                </Link>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white hover:bg-white/12">
                  分享 <Share2 className="h-4 w-4" />
                </button>
              </div>
            </section>
            <section className="rounded-2xl border border-brand-blue/20 bg-brand-blue/6 p-6">
              {user ? (
                hasDashboardUrl() ? (
                  <a
                    href={getDashboardUrl(`/competition/${slug}/register`, accessToken)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue-2"
                  >
                    立即报名 <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-brand-blue/30 px-4 py-3 text-center text-sm text-slate-500">
                    创业者工作台地址未配置，暂不可跳转报名
                  </div>
                )
              ) : (
                <button
                  onClick={openLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue-2"
                >
                  登录后报名 <LogIn className="h-4 w-4" />
                </button>
              )}
              <p className="mt-3 text-center text-xs text-slate-500">报名将跳转至创业者工作台，复用您的项目资料完成赛事报名。</p>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}