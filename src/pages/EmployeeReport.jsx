import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { EmployeeLayout } from '../components/Layout'
import { FiCalendar, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi'
import { format } from 'date-fns'

const STATUS_MAP = {
  present:     { ar: 'حاضر',         cls: 'badge-present' },
  late:        { ar: 'متأخر',        cls: 'badge-late'    },
  absent:      { ar: 'غائب',         cls: 'badge-absent'  },
  early_leave: { ar: 'انصراف مبكر', cls: 'badge-late'    },
}

export default function EmployeeReport() {
  const { employee } = useStore()
  const [month, setMonth]   = useState(format(new Date(), 'yyyy-MM'))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadReport() }, [month])

  const loadReport = async () => {
    setLoading(true); setReport(null)
    try {
      const res = await api.getReport(employee.employee_id, month, '')
      if (res.success) setReport(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const s = report?.summary

  return (
    <EmployeeLayout title="تقاريري" subtitle={employee?.name}>
      <div className="px-4 pt-4 pb-6 space-y-4">

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

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {s && !loading && (
          <>
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<FiClock     className="w-5 h-5 text-green-500" />} label="أيام الحضور"        value={s.days_present}               color="green" />
              <StatCard icon={<FiAlertCircle className="w-5 h-5 text-amber-500" />} label="أيام التأخير"     value={s.late_days}                  color="amber" />
              <StatCard icon={<FiClock     className="w-5 h-5 text-blue-500"  />} label="إجمالي الساعات"    value={`${s.total_hours} س`}         color="blue"  />
              <StatCard icon={<FiTrendingUp className="w-5 h-5 text-red-500"  />} label="خصم التأخير"       value={`${s.late_deduction} ج`}      color="red"   />
            </div>

            {/* Details */}
            <div className="card space-y-3">
              <h3 className="font-bold text-sm dark:text-white">تفاصيل الشهر</h3>
              {[
                { label: 'إجمالي دقائق التأخير',    value: `${s.late_minutes_total} دقيقة`,   color: 'text-amber-600 dark:text-amber-400' },
                { label: 'دقائق الانصراف المبكر',   value: `${s.early_leave_minutes_total} دقيقة`, color: 'text-orange-500' },
                { label: 'دقائق الأوفر تايم',       value: `${s.overtime_minutes_total} دقيقة`,   color: 'text-green-600 dark:text-green-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                  <span className="text-sm text-gray-500 dark:text-dark-muted">{item.label}</span>
                  <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Records */}
            <div className="card space-y-2">
              <h3 className="font-bold text-sm dark:text-white">سجل الحضور ({report.records.length} يوم)</h3>
              <div className="space-y-1 max-h-96 overflow-auto">
                {report.records.length === 0 && (
                  <p className="text-center text-gray-400 py-4 text-sm">لا يوجد سجلات</p>
                )}
                {report.records.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                    <div>
                      <p className="font-semibold text-sm dark:text-white">{r.date}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                        {r.check_in_time || '--'} → {r.check_out_time || '--'}
                        {r.late_minutes > 0 && (
                          <span className="text-amber-500 mr-2">({r.late_minutes} د تأخير)</span>
                        )}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_MAP[r.status]?.cls || 'badge-absent'}`}>
                      {STATUS_MAP[r.status]?.ar || r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !report && (
          <div className="text-center py-16 text-gray-400 dark:text-dark-muted">
            <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>لا يوجد بيانات لهذا الشهر</p>
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    green:  'bg-green-50 dark:bg-green-900/20',
    amber:  'bg-amber-50 dark:bg-amber-900/20',
    blue:   'bg-blue-50  dark:bg-blue-900/20',
    red:    'bg-red-50   dark:bg-red-900/20',
  }
  return (
    <div className={`stat-card ${colors[color]}`}>
      {icon}
      <p className="text-2xl font-black dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
    </div>
  )
}
