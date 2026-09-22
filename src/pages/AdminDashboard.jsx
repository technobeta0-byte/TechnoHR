import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiRefreshCw, FiCalendar, FiAlertTriangle } from 'react-icons/fi'

export default function AdminDashboard() {
  const { adminToken } = useStore()
  const [dash, setDash]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getDashboard(adminToken)
      if (res.success) setDash(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const d = dash

  return (
    <AdminLayout
      title="TechnoHR"
      subtitle="Dashboard"
      extra={
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors">
          <FiRefreshCw className={`w-4 h-4 text-gold-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      {loading && !d ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : d ? (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 dark:text-dark-muted font-medium">{d.date}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<FiUsers          className="w-5 h-5" />} label="إجمالي الموظفين" value={d.total_employees}   color="blue"   />
            <Stat icon={<FiCheckCircle    className="w-5 h-5" />} label="حاضرون الآن"     value={d.present_now}      color="green"  />
            <Stat icon={<FiClock          className="w-5 h-5" />} label="انصرفوا"          value={d.checked_out}      color="purple" />
            <Stat icon={<FiAlertCircle    className="w-5 h-5" />} label="متأخرون"          value={d.late_today}       color="amber"  />
            <Stat icon={<FiXCircle        className="w-5 h-5" />} label="غائبون اليوم"     value={d.absent_today}     color="red"    />
            <Stat icon={<FiAlertTriangle  className="w-5 h-5" />} label="نسيان بصمة"       value={d.forgot_checkout ?? 0} color="orange" />
            <Stat icon={<FiCalendar       className="w-5 h-5" />} label="طلبات إجازة"      value={d.pending_leaves}   color="blue"   />
          </div>

          {/* Absent List */}
          {d.absent_list?.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-bold text-sm text-red-500 dark:text-red-400">
                الغائبون اليوم ({d.absent_list.length})
              </h3>
              {d.absent_list.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-500">{e.name?.[0]}</span>
                    </div>
                    <span className="text-sm font-medium dark:text-white">{e.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-dark-muted">{e.id}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Check-ins */}
          {d.recent_attendance?.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-bold text-sm dark:text-white">آخر تسجيلات الحضور</h3>
              {d.recent_attendance.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold-600">{r.employee_name?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{r.employee_name}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{r.check_in_time}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${
                    r.status === 'present'         ? 'present'
                    : r.status === 'late'          ? 'late'
                    : r.status === 'forgot_checkout'? 'forgot'
                    : 'absent'
                  }`}>
                    {r.status === 'present'          ? 'حاضر'
                     : r.status === 'late'           ? 'متأخر'
                     : r.status === 'forgot_checkout'? 'نسيان بصمة'
                     : r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">فشل تحميل البيانات</div>
      )}
    </AdminLayout>
  )
}

function Stat({ icon, label, value, color }) {
  const map = {
    blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
    green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400',
    amber:  'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  }
  return (
    <div className={`stat-card ${map[color]}`}>
      {icon}
      <p className="text-3xl font-black">{value ?? '--'}</p>
      <p className="text-xs font-semibold opacity-80">{label}</p>
    </div>
  )
}
