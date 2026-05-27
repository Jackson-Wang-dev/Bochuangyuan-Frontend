import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { StaffMember } from '@bochuangyuan/types'

// TODO: replace with API call to fetch organization staff list (endpoint TBD)
const MOCK_STAFF: StaffMember[] = [
  { staffId: 's-1', name: '刘管理', email: 'liu@example.com', role: 'admin',    joinedAt: '2024-01-01' },
  { staffId: 's-2', name: '张审核', email: 'zhang@example.com', role: 'reviewer', joinedAt: '2024-02-15' },
  { staffId: 's-3', name: '王浏览', email: 'wang@example.com', role: 'viewer',  joinedAt: '2024-03-20' },
]

const ROLE_LABELS: Record<StaffMember['role'], string> = {
  admin:    '管理员',
  reviewer: '审核员',
  viewer:   '浏览者',
}

const ROLE_COLORS: Record<StaffMember['role'], string> = {
  admin:    'bg-brand-blue/10 text-brand-blue',
  reviewer: 'bg-violet-50 text-violet-600',
  viewer:   'bg-slate-100 text-slate-500',
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as StaffMember['role'] })

  const handleAdd = () => {
    if (!form.name || !form.email) return
    // TODO: call invite/add staff API; use returned staffId instead of local Date.now()
    const member: StaffMember = { ...form, staffId: `s-${Date.now()}`, joinedAt: new Date().toISOString().slice(0, 10) }
    setStaff((s) => [...s, member])
    setForm({ name: '', email: '', role: 'viewer' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">员工管理</h1>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加工作人员
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">添加工作人员</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="姓名 *"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="邮箱 *"
              type="email"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffMember['role'] }))}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="viewer">浏览者</option>
              <option value="reviewer">审核员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
            添加
          </button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">姓名</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">邮箱</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">角色</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">加入时间</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.map((member) => (
              <tr key={member.staffId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{member.name}</td>
                <td className="px-4 py-3 text-slate-500">{member.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{member.joinedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setStaff((s) => s.filter((x) => x.staffId !== member.staffId))}
                    className="text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
