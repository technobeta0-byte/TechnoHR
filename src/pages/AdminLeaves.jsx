import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiCheck, FiX } from 'react-icons/fi'

export default function AdminLeaves() {
  const { adminToken } = useStore()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { load() }, [filter])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getLeaves(adminToken, '')
      if (res.success) setLeaves(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const handle = async (leaveId, action) => {
    try {
      const res = await api.approveLeave(leaveId, action, adminToken)
      if (res.success) load()
    } catch {}
  }

  const filtered = leaves.filter(l => filter === 'all' ? true : l.status === filter)
  const FILTERS = [['pending','معلق'],['approved','موافق'],['rejected','مرفوض'],['all','الكل']]
  const TYPE = { annual:'سنوية', sick:'مرضية', unpaid:'بدون مرتب', emergency:'طارئة' }

  return (
    <AdminLayout title="الإجازات" subtitle={`${filtered.length} طلب`}>
      <div className="grid grid-cols-4 gap-1 bg-gray-100 dark:bg-dark-card2 rounded-2xl p-1">
        {FILTERS.map(([k,ar]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${filter===k ? 'bg-gold-500 text-white shadow' : 'text-gray-500 dark:text-dark-muted'}`}>{ar}</button>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
      : filtered.length === 0 ? <div className="text-center py-10 text-gray-400">لا يوجد طلبات</div>
      : filtered.map((l, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold dark:text-white">{l.employee_name}</p>
              <p className="text-xs text-gray-400">{l.start_date} → {l.end_date} ({l.days_count} أيام)</p>
              <p className="text-xs text-gray-400 mt-1">{TYPE[l.leave_type] || l.leave_type} · {l.reason || 'لا يوجد سبب'}</p>
            </div>
            <span className={`badge badge-${l.status}`}>{l.status === 'pending' ? 'معلق' : l.status === 'approved' ? 'موافق' : 'مرفوض'}</span>
          </div>
          {l.status === 'pending' && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handle(l.leave_id, 'approve')}
                className="flex items-center justify-center gap-1 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold">
                <FiCheck />موافقة
              </button>
              <button onClick={() => handle(l.leave_id, 'reject')}
                className="flex items-center justify-center gap-1 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold">
                <FiX />رفض
              </button>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  )
}
