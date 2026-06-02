import { useState } from 'react'
import { CheckCircle2, Clock, XCircle, Wallet, FileText } from 'lucide-react'
import type { PayoutStatus } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

type AwardLevel = 'First' | 'Second' | 'Third' | 'Honorable'

interface WinnerRow {
  projectId: string
  projectName: string
  teamName: string
  level: AwardLevel
  bonus: number
  payoutStatus: PayoutStatus
  bankVerified: boolean
}

const MOCK_WINNERS: WinnerRow[] = [
  { projectId: 'proj-5', projectName: '区块链供应链溯源',      teamName: '链信科技',   level: 'First',    bonus: 50000, payoutStatus: 'QualifyChecking', bankVerified: true  },
  { projectId: 'proj-3', projectName: '医疗影像 AI 辅助诊断',  teamName: '健影团队',   level: 'Second',   bonus: 20000, payoutStatus: 'PendingClaim',     bankVerified: true  },
  { projectId: 'proj-1', projectName: 'AI 分布式算力平台',      teamName: '算力先锋队', level: 'Second',   bonus: 20000, payoutStatus: 'PendingClaim',     bankVerified: false },
  { projectId: 'proj-2', projectName: '碳中和智能监测系统',    teamName: '绿能科技',   level: 'Third',    bonus: 10000, payoutStatus: 'PendingClaim',     bankVerified: false },
]

const LEVEL_LABEL: Record<AwardLevel, string> = {
  First: '一等奖', Second: '二等奖', Third: '三等奖', Honorable: '优秀奖',
}
const LEVEL_BADGE: Record<AwardLevel, string> = {
  First: 'bg-amber-100 text-amber-700', Second: 'bg-slate-200 text-slate-600',
  Third: 'bg-amber-50 text-amber-800',  Honorable: 'bg-sky-50 text-sky-600',
}
const PAYOUT_INFO: Record<PayoutStatus, { label: string; icon: React.ElementType; color: string }> = {
  PendingClaim:     { label: '待认领', icon: Clock,         color: 'text-amber-500'  },
  BankInfoUploaded: { label: '已上传银行信息', icon: FileText,     color: 'text-blue-500'   },
  QualifyChecking:  { label: '资质审核中', icon: Clock,     color: 'text-violet-500' },
  Paid:             { label: '已打款', icon: CheckCircle2,  color: 'text-emerald-500'},
  CannotPay:        { label: '无法打款', icon: XCircle,     color: 'text-red-400'    },
}

export default function SettlementManagementPage() {
  const [rows, setRows] = useState<WinnerRow[]>(MOCK_WINNERS)

  const updatePayout = (projectId: string, status: PayoutStatus) => {
    setRows((prev) => prev.map((r) => r.projectId === projectId ? { ...r, payoutStatus: status } : r))
  }

  const totalBonus = rows.reduce((s, r) => s + r.bonus, 0)
  const paidCount  = rows.filter((r) => r.payoutStatus === 'Paid').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-slate-800">结算管理</h1>
        <p className="text-sm text-slate-400 mt-0.5">管理获奖奖金发放与报销事项</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '获奖项目总数',  value: rows.length,                               unit: '个',  color: 'text-brand-blue' },
          { label: '已打款',        value: paidCount,                                  unit: '个',  color: 'text-emerald-600' },
          { label: '奖金池总额',    value: `¥${(totalBonus / 10000).toFixed(0)} 万`, unit: '',    color: 'text-slate-800' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="glass-card p-4 space-y-1 text-center">
            <div className={cn('text-2xl font-black', color)}>{value}<span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span></div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">项目名称</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">奖项</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">奖金</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">银行信息</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">打款状态</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => {
              const payoutInfo = PAYOUT_INFO[row.payoutStatus]
              const PayoutIcon = payoutInfo.icon
              return (
                <tr key={row.projectId} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{row.projectName}</div>
                    <div className="text-xs text-slate-400">{row.teamName}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', LEVEL_BADGE[row.level])}>
                      {LEVEL_LABEL[row.level]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-slate-800 tabular-nums">
                    ¥{row.bonus.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.bankVerified ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 已填写
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> 待填写
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('flex items-center justify-center gap-1 text-xs font-semibold', payoutInfo.color)}>
                      <PayoutIcon className="w-3.5 h-3.5" />
                      {payoutInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.payoutStatus === 'BankInfoUploaded' && (
                      <button
                        onClick={() => updatePayout(row.projectId, 'QualifyChecking')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg text-xs font-bold mx-auto transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> 开始审核
                      </button>
                    )}
                    {row.payoutStatus === 'QualifyChecking' && (
                      <button
                        onClick={() => updatePayout(row.projectId, 'Paid')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold mx-auto transition-colors"
                      >
                        <Wallet className="w-3.5 h-3.5" /> 确认打款
                      </button>
                    )}
                    {row.payoutStatus === 'PendingClaim' && row.bankVerified && (
                      <button
                        onClick={() => updatePayout(row.projectId, 'BankInfoUploaded')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold mx-auto transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> 确认银行信息
                      </button>
                    )}
                    {row.payoutStatus === 'Paid' && (
                      <span className="text-xs text-slate-300">已完成</span>
                    )}
                    {row.payoutStatus === 'CannotPay' && (
                      <span className="text-xs text-red-400">无法打款</span>
                    )}
                    {row.payoutStatus === 'PendingClaim' && !row.bankVerified && (
                      <span className="text-xs text-slate-300">等待填写银行信息</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
