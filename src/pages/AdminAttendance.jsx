import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'

const STATUS = {
  present:     { ar: 'حاضر',          cls: 'badge-present' },
  late:        { ar: 'متأخر',         cls: 'badge-late'    },
  absent:      { ar: 'غائب',          cls: 'badge-absent'  },
  early_leave: { ar: 'انصراف مبكر',  cls: 'badge-late'    },
}

export default function AdminAttendance() {
  const { adminToken } = useStore()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]     = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => { load() }, [month])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getAttendance('', month)
      if (res.success) setRecords(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <AdminLayout title="سجل الحضور" subtitle={`${records.length} سجل`}>
      {/* Month Picker */}
      <div className="card flex items-center gap-3">
        <FiCalendar className="text-gold-500 flex-shrink-0" />
        <input
          type="month"
          className="input-field"
          value={month}
          onChange={e => setMonth(e.target.value)}
          max={format(new Date(), 'yyyy-MM')}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-dark-muted">
          <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا يوجد سجلات لهذا الشهر</p>
        </div>
      ) : (
        records.map((r, i) => (
          <div key={i} className="card space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold dark:text-white">{r.employee_name}</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted">{r.date} · {r.employee_id}</p>
              </div>
              <span className={`badge ${STATUS[r.status]?.cls || 'badge-absent'}`}>
                {STATUS[r.status]?.ar || r.status}
              </span>
            </div>

            {/* Times Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <TimeBox label="الحضور"   value={r.check_in_time  || '--'} />
              <TimeBox label="الانصراف" value={r.check_out_time || '--'} />
              <TimeBox label="الساعات"  value={r.total_hours ? `${r.total_hours} س` : '--'} />
            </div>

            {/* Late / Deduction */}
            {(r.late_minutes > 0 || r.deduction_amount > 0) && (
              <div className="flex items-center gap-4 text-xs">
                {r.late_minutes > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    تأخير: {r.late_minutes} دقيقة
                  </span>
                )}
                {r.deduction_amount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    خصم: {r.deduction_amount} ج
                  </span>
                )}
                {r.location_verified === 'FALSE' && (
                  <span className="text-orange-500 font-semibold">⚠️ موقع غير محقق</span>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </AdminLayout>
  )
}

function TimeBox({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-dark-card2 rounded-2xl py-2 px-1">
      <p className="text-xs text-gray-400 dark:text-dark-muted">{label}</p>
      <p className="font-bold text-sm dark:text-white mt-0.5">{value}</p>
    </div>
  )
}
