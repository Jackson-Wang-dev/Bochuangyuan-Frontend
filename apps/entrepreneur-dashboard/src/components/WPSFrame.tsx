import { useEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'
import type { DocumentSessionResponse } from '@bochuangyuan/api'

interface Props {
  title: string
  session: DocumentSessionResponse
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WPS_SDK_URL = (import.meta as any).env?.VITE_WPS_SDK_URL as string | undefined
  ?? 'https://wwo.wps.cn/office-online/sdk/sdk.js'

function loadWpsSDK(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).WebOfficeSDK) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${WPS_SDK_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.src = WPS_SDK_URL
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('WPS SDK 加载失败，请检查网络或 SDK 地址配置'))
    document.head.appendChild(script)
  })
}

export function WPSFrame({ title, session, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    loadWpsSDK()
      .then(() => {
        if (!mounted || !containerRef.current) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wps = (window as any).WebOfficeSDK.config({
          appId: session.app_id,
          fileId: session.file_id,
          token: session.token,
          officeType: session.office_type,
          mode: session.mode,
          mount: containerRef.current,
        })
        instanceRef.current = wps
        setLoading(false)
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
      instanceRef.current?.destroy?.()
      instanceRef.current = null
    }
  }, [session])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-6 shrink-0 shadow-sm">
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all group"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <span className="text-sm font-bold text-slate-800 truncate max-w-[40%]">{title}</span>
        <span className="text-xs text-slate-400 font-medium">
          {session.mode === 'edit' ? '编辑模式' : '预览模式'}
        </span>
      </nav>

      <div className="flex-1 relative overflow-hidden">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 font-medium">正在加载 WPS 编辑器...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="text-center space-y-4 max-w-sm px-6">
              <p className="text-sm text-rose-500 font-medium">{error}</p>
              <button
                onClick={onClose}
                className="text-xs text-slate-400 underline underline-offset-2"
              >
                返回列表
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </motion.div>
  )
}
