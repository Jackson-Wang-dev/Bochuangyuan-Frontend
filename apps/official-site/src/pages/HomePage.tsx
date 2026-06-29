import { ArrowRight, FileCheck2, Landmark, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHomeData } from '../api/site'
import { CompetitionCarousel, FeatureCard, NewsCard, PartnersStrip, SectionHeader, SiteFooter, SiteHeader, StatCard } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import { getDashboardUrl } from '../lib/dashboard'
import { useSiteAuth } from '../store/siteAuth'
import type { SiteHomeData } from '../types'

export function HomePage() {
  const [data, setData] = useState<SiteHomeData>(mockHomeData)
  const { user, accessToken } = useSiteAuth()

  useEffect(() => {
    let alive = true
    void getHomeData().then((next) => alive && setData(next))
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={data.navItems} />
      <section className="hero-light flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/16 bg-white px-4 py-2 text-sm text-brand-blue shadow-sm">
              <Sparkles className="h-4 w-4" /> 博士后创新创业陪伴系统官网
            </div>
            <h1 className="mt-7 text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">博创网</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">陪伴博士后创新创业的全周期</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              面向博士后创新创业的统一门户，承接赛事发布、项目服务、新闻资讯与后续的真实数据接入。
            </p>
            {user && (
              <div className="mt-7 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/8 px-5 py-3 text-sm text-slate-800">
                <Sparkles className="h-4 w-4 text-brand-blue" />
                欢迎回来，{user.username} · 继续完善您的项目
                <a href={getDashboardUrl('', accessToken)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-2">
                  进入我的工作台 <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                  <div className="font-mono text-lg font-semibold tabular-nums text-slate-950">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <a href="#products" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-blue/30 hover:shadow-md">
                <FileCheck2 className="h-6 w-6 text-brand-blue" />
                <div className="mt-3 text-base font-semibold text-slate-950">创业者入口</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">完成测评、一键报名赛事、管理项目 BP</p>
              </a>
              <a href="#ecosystem" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-blue/30 hover:shadow-md">
                <Landmark className="h-6 w-6 text-brand-blue" />
                <div className="mt-3 text-base font-semibold text-slate-950">园区 / 机构入口</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">赛事运营、招商转化与数据看板</p>
              </a>
            </div>
            <a
              href="#about"
              className="relative flex min-h-[220px] flex-1 flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-lg shadow-black/10"
            >
              <img
                src="https://picsum.photos/seed/bochuang-ecosystem/960/540"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/75 to-brand-ink/25" />
              <div className="relative z-10">
                <div className="text-xl font-semibold">加入博创网生态</div>
                <p className="mt-2 text-sm leading-6 text-white/80">与产业、资本、园区共建创新创业全周期网络</p>
              </div>
              <span className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-cyan">
                查看合作方式 <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="ECOSYSTEM" title="线上平台与线下资源协同" desc="官网先承接公开展示和入口聚合，后续可与创业陪伴系统、赛事工作台和资源 CRM 打通。" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.ecosystem.map((item) => <FeatureCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section id="competitions" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="COMPETITIONS" title="大赛动态与项目入口" desc="展示正在开放、征集中和回顾中的赛事，静止时自动轮播，详情页已预留后端数据替换接口。" />
          <div className="mt-10">
            <CompetitionCarousel items={data.competitions} />
          </div>
          <div className="mt-8 text-center">
            <Link to="/competitions" className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-medium text-white hover:bg-brand-blue-2">
              查看全部赛事 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="products" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="SERVICES" title="围绕创业陪伴的核心产品" desc="从创业者测评、报名协作、评审管理到资源对接，覆盖需求书中的官网展示与未来业务承接。" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {data.products.map((item) => <FeatureCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="console-panel relative mx-auto max-w-7xl overflow-hidden rounded-3xl p-6 shadow-xl shadow-black/10 sm:p-8">
          <img
            src="https://picsum.photos/seed/bochuang-platform-data/1600/500"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-brand-ink/90 to-brand-ink/80" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-cyan">PLATFORM DATA</p>
              <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">平台运行数据看板</h2>
            </div>
            <Link to="/news" className="hidden text-sm font-medium text-white/72 hover:text-white sm:inline-flex">
              查看更多动态 →
            </Link>
          </div>
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.stats.map((stat, index) => <StatCard key={stat.label} stat={stat} accent={index % 2 === 0 ? 'cyan' : 'blue'} />)}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="PARTNERS" title="支持单位与合作机构" desc="联动高校、科研机构、产业园区与金融伙伴，共同支撑赛事与项目落地。" />
          <div className="mt-10">
            <PartnersStrip partners={data.partners} />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="NEWS" title="新闻资讯与政策动态" desc="以博客化方式沉淀政策解读、赛事预告和产业观察。" />
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {data.news.slice(0, 4).map((item) => <NewsCard key={item.slug} item={item} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/news" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue">
              进入资讯页 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}