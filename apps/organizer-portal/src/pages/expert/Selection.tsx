import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, UserPlus } from 'lucide-react'
import { ExpertPicker } from '@/components/ExpertPicker'
import { useExpertStore } from '@/store/expertStore'
import type { Expert } from '@bochuangyuan/types'

export default function ExpertSelectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedExperts, selectExpert, deselectExpert, addManualExpert } = useExpertStore()
  const [showManual, setShowManual] = useState(false)
  const [manualForm, setManualForm] = useState({ name: '', organization: '', contactInfo: '' })

  const handleAddManual = () => {
    if (!manualForm.name || !manualForm.organization) return
    const expert: Expert = {
      expertId: `manual-${Date.now()}`,
      name: manualForm.name,
      organization: manualForm.organization,
      domain: [],
      source: 'manual',
      contactInfo: manualForm.contactInfo,
    }
    addManualExpert(expert)
    selectExpert(expert)
    setManualForm({ name: '', organization: '', contactInfo: '' })
    setShowManual(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">专家遴选</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManual((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> 手动录入
          </button>
          <button
            onClick={() => navigate(`/competitions/${id}/assignment`)}
            disabled={selectedExperts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-brand-blue/90 transition-colors"
          >
            下一步：分配任务 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showManual && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">手动录入外部专家</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={manualForm.name}
              onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="姓名 *"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <input
              value={manualForm.organization}
              onChange={(e) => setManualForm((f) => ({ ...f, organization: e.target.value }))}
              placeholder="机构 *"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <input
              value={manualForm.contactInfo}
              onChange={(e) => setManualForm((f) => ({ ...f, contactInfo: e.target.value }))}
              placeholder="联系方式（选填）"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <button
            onClick={handleAddManual}
            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            添加并选中
          </button>
        </div>
      )}

      <ExpertPicker
        selected={selectedExperts}
        onSelect={selectExpert}
        onDeselect={deselectExpert}
      />
    </div>
  )
}
