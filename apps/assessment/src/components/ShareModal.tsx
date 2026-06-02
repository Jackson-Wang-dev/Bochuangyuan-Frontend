import { Check, Copy, Share2, X } from 'lucide-react'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface ShareModalProps {
  reportUuid: string
  personaName: string
  onClose: () => void
}

export default function ShareModal({ reportUuid, personaName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/report/${reportUuid}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[768px] bg-white rounded-t-3xl p-6 pb-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-[#0045c4]" />
            <h3 className="text-lg font-bold text-slate-900">分享报告</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-3">
            <QRCodeSVG value={shareUrl} size={140} level="M" />
          </div>
          <p className="text-sm text-slate-500 text-center">
            扫码查看 <span className="text-[#0045c4] font-medium">{personaName}</span> 报告
          </p>
        </div>

        {/* Link copy */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            className={[
              'flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all active:scale-95',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-[#0045c4] text-white hover:bg-[#003ba8]',
            ].join(' ')}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制链接'}
          </button>
        </div>

        {/* Platform promo */}
        <div className="bg-[#0045c4]/5 rounded-2xl p-4 border border-[#0045c4]/10">
          <p className="text-xs text-slate-500 mb-1">发现更多</p>
          <p className="text-sm font-semibold text-slate-800">博创园 · 创业者成长平台</p>
          <p className="text-xs text-slate-500 mt-1">创业课程 / 创业者社群 / 商业计划评估</p>
        </div>
      </div>
    </div>
  )
}
