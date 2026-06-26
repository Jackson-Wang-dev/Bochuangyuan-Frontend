import { ArrowRight, BarChart3, CheckCircle2, LineChart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHomeData } from '../api/site'
import { CompetitionCard, FeatureCard, NewsCard, PastProjectCard, SectionHeader, SiteFooter, SiteHeader, StatCard } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import type { SiteHomeData } from '../types'

export function HomePage() {
  const [data, setData] = useState<SiteHomeData>(mockHomeData)

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
      <section className="hero-ink overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/72">
              <Sparkles className="h-4 w-4 text-brand-cyan" /> 博士后创新创业陪伴系统官网
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">博士后创新创业的全周期陪伴平台</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              面向博士后创新创业的统一门户，承接赛事发布、项目服务、新闻资讯与后续的真实数据接入。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#competitions" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-brand-ink shadow-lg shadow-black/20 hover:bg-white/95">
                查看大赛动态 <ArrowRight className="h-4 w-4 text-brand-blue" />
              </a>
              <Link to="/news" className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white hover:bg-white/12">
                阅读新闻资讯
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {data.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
            </div>
          </div>
          <div className="dashboard-frame rounded-[28px] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/25 backdrop-blur">
            <div className="rounded-3xl bg-white p-5 text-slate-950 shadow-xl">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">项目陪伴看板</p>
                  <h2 className="mt-1 text-xl font-semibold">从报名到转化</h2>
                </div>
                <div className="rounded-xl bg-brand-blue/8 p-3 text-brand-blue"><BarChart3 className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 space-y-4">
                {['创业测评', 'BP 协作', '专家评审', '资源对接'].map((step, index) => (
                  <div key={step} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-sm font-semibold text-white">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{step}</div>
                      <div className="mt-1 h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${55 + index * 12}%` }} /></div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-brand-ink p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-medium"><LineChart className="h-4 w-4 text-brand-cyan" /> 接口已预留</div>
                <p className="mt-2 text-xs leading-6 text-white/62">配置 VITE_BC_SITE_API_BASE_URL 后，首页、赛事、优秀项目和资讯会优先请求真实接口，失败时回退模拟数据。</p>
              </div>
            </div>
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
          <SectionHeader eyebrow="COMPETITIONS" title="大赛动态与项目入口" desc="展示正在开放、征集中和回顾中的赛事，详情页已预留后端数据替换接口。" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {data.competitions.map((item) => <CompetitionCard key={item.slug} item={item} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/competitions" className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-medium text-white hover:bg-brand-blue-2">
              查看全部赛事 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="projects" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="PAST PROJECTS" title="往届优秀项目" desc="展示赛事沉淀出的代表性项目，突出技术方向、转化阶段、对接成果与后续服务价值。" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {data.pastProjects.map((item) => <PastProjectCard key={item.slug} item={item} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/projects" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue">
              查看更多 <ArrowRight className="h-4 w-4" />
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
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="NEWS" title="新闻资讯与政策动态" desc="以博客化方式沉淀政策解读、赛事预告和产业观察。" />
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {data.news.map((item) => <NewsCard key={item.slug} item={item} />)}
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