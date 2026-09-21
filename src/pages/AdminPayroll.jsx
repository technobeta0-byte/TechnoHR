import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiDollarSign, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'

export default function AdminPayroll() {
  const { adminToken } = useStore()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [month])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getPayroll(month, adminToken)
      if (res.success) setRecords(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const calculate = async () => {
    setCalculating(true); setMsg(null)
    try {
      const res = await api.calcPayroll(month, adminToken)
      if (res.success) { setMsg({ type:'success', text: res.message }); load() }
      else setMsg({ type:'error', text: res.error })
    } catch (e) { setMsg({ type:'error', text: e.message }) }
    finally { setCalculating(false) }
  }

  return (
    <AdminLayout title="الرواتب" subtitle={month}>
      <div className="card flex items-center gap-2">
        <input type="month" className="input-field" value={month} onChange={e => setMonth(e.target.value)} max={format(new Date(), 'yyyy-MM')} />
        <button onClick={calculate} disabled={calculating} className="btn-gold px-4 py-3 shrink-0 gap-1 w-auto">
          {calculating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiRefreshCw className="w-4 h-4" />احسب</>}
        </button>
      </div>

      {msg && (
        <div className={`rounded-2xl p-3 text-sm text-center font-semibold ${
          msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'
        }`}>{msg.text}</div>
      )}

      {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
      : records.length === 0 ? (
        <div className="card text-center py-8 space-y-2">
          <FiDollarSign className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400">لا يوجد رواتب محسوبة - اضغط احسب</p>
        </div>
      ) : records.map((r, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold dark:text-white">{r.employee_name}</p>
              <p className="text-xs text-gray-400">{r.employee_id}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400">الراتب الصافي</p>
              <p className="text-xl font-black gradient-text">{r.net_salary} ج</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-50 dark:bg-dark-card2 rounded-xl p-2">
              <p className="text-gray-400">الأساسي</p>
              <p className="font-bold dark:text-white">{r.base_salary}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
              <p className="text-red-400">الخصومات</p>
              <p className="font-bold text-red-600">{r.total_deductions}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
              <p className="text-green-400">أوفر تايم</p>
              <p className="font-bold text-green-600">{r.overtime_pay}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>حضور: {r.days_present} يوم</span>
            <span>غياب: {r.absent_days} يوم</span>
            <span>تأخير: {r.late_minutes_total} د</span>
          </div>
        </div>
      ))}
    </AdminLayout>
  )
}
