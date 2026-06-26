import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink flex min-h-[70vh] items-center px-4 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">页面未找到</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">返回首页继续浏览博创网内容。</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-brand-ink shadow-lg shadow-black/20 hover:bg-white/95">
            返回首页 <ArrowRight className="h-4 w-4 text-brand-blue" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}