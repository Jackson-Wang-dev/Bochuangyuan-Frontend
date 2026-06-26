import { ArrowRight, Clock3, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getNewsDetail } from '../api/site'
import { DetailPanel, SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import type { SiteNewsArticle } from '../types'

export function NewsDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<SiteNewsArticle | null>(null)

  useEffect(() => {
    if (!slug) return
    let alive = true
    void getNewsDetail(slug).then((next) => alive && setItem(next))
    return () => {
      alive = false
    }
  }, [slug])

  if (!slug) return <Navigate to="/news" replace />

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">新闻详情</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{item?.title ?? '资讯详情'}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{item?.summary ?? '正在加载资讯内容。'}</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/72">
            <Clock3 className="h-4 w-4" /> {item?.date ?? '-'} / {item?.type ?? '-'} / {item?.author ?? '-'}
          </div>
        </div>
      </section>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
            <div className="space-y-5 text-base leading-9 text-slate-700">
              {(item?.body ?? ['加载中。']).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
          <div className="space-y-6">
            <DetailPanel title="文章摘要">{item?.summary ?? '加载中。'}</DetailPanel>
            <section className="rounded-2xl border border-slate-200 bg-brand-ink p-6 text-white shadow-sm">
              <div className="font-mono text-sm uppercase tracking-[0.2em] text-white/50">接口预留</div>
              <p className="mt-3 text-sm leading-7 text-white/68">资讯详情页已经抽象为 slug、summary、author 和 body[] 结构，可直接由后端或 CMS 返回。</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/news" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:bg-white/95">
                  返回博客 <ArrowRight className="h-4 w-4 text-brand-blue" />
                </Link>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white hover:bg-white/12">
                  分享 <Share2 className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}