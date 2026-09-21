import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiSearch, FiChevronLeft } from 'react-icons/fi'
import { format } from 'date-fns'

export default function AdminEmployees() {
  const { adminToken } = useStore()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [report, setReport]       = useState(null)
  const [repMonth, setRepMonth]   = useState(format(new Date(), 'yyyy-MM'))
  const [repLoading, setRepLoading] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.getEmployees(adminToken)
      if (res.success) setEmployees(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const selectEmployee = async (emp) => {
    setSelected(emp); setReport(null); setRepLoading(true)
    try {
      const res = await api.getReport(emp.employee_id, repMonth, adminToken)
      if (res.success) setReport(res.data)
    } catch {}
    finally { setRepLoading(false) }
  }

  const loadReport = async () => {
    if (!selected) return
    setRepLoading(true); setReport(null)
    try {
      const res = await api.getReport(selected.employee_id, repMonth, adminToken)
      if (res.success) setReport(res.data)
    } catch {}
    finally { setRepLoading(false) }
  }

  const filtered = employees.filter(e =>
    !search ||
    e.name?.includes(search) ||
    e.employee_id?.includes(search.toUpperCase()) ||
    e.department?.includes(search)
  )

  // Employee Detail View
  if (selected) {
    const s = report?.summary
    return (
      <AdminLayout title={selected.name} subtitle={`${selected.employee_id} · ${selected.department || 'بدون قسم'}`}>
        <button
          onClick={() => { setSelected(null); setReport(null) }}
          className="flex items-center gap-1 text-gold-600 dark:text-gold-400 text-sm font-bold mb-2"
        >
          <FiChevronLeft /> العودة للقائمة
        </button>

        {/* Month Picker */}
        <div className="card flex items-center gap-2">
          <input
            type="month"
            className="input-field"
            value={repMonth}
            onChange={e => setRepMonth(e.target.value)}
            max={format(new Date(), 'yyyy-MM')}
          />
          <button onClick={loadReport} className="btn-gold px-5 py-3 w-auto shrink-0">عرض</button>
        </div>

        {/* Employee Info */}
        <div className="card grid grid-cols-2 gap-3">
          {[
            { label: 'الراتب الشهري',   value: `${selected.monthly_salary || 0} ج` },
            { label: 'أجر الساعة',      value: `${selected.hourly_rate || 0} ج` },
            { label: 'الشيفت',          value: `${selected.fixed_start_time} - ${selected.fixed_end_time}` },
            { label: 'أيام الإجازة',    value: `${selected.annual_leave_days || 21} يوم` },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-dark-card2 rounded-2xl p-3">
              <p className="text-xs text-gray-400 dark:text-dark-muted">{item.label}</p>
              <p className="font-bold dark:text-white text-sm mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {repLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {s && !repLoading && (
          <>
            <div className="card space-y-2">
              <h3 className="font-bold text-sm dark:text-white">ملخص {repMonth}</h3>
              {[
                { label: 'أيام الحضور',      value: s.days_present,               color: 'text-green-600 dark:text-green-400' },
                { label: 'دقائق التأخير',    value: `${s.late_minutes_total} د`,  color: 'text-amber-600 dark:text-amber-400' },
                { label: 'خصم التأخير',      value: `${s.late_deduction} ج`,      color: 'text-red-600   dark:text-red-400'   },
                { label: 'إجمالي الساعات',   value: `${s.total_hours} ساعة`,      color: 'text-blue-600  dark:text-blue-400'  },
                { label: 'الأوفر تايم',      value: `${s.overtime_minutes_total} د`, color: 'text-green-600 dark:text-green-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                  <span className="text-sm text-gray-500 dark:text-dark-muted">{item.label}</span>
                  <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="card space-y-2">
              <h3 className="font-bold text-sm dark:text-white">سجل الحضور ({report.records.length} سجل)</h3>
              <div className="space-y-1 max-h-80 overflow-auto">
                {report.records.map((r, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                    <div>
                      <p className="font-semibold text-sm dark:text-white">{r.date}</p>
                      <p className="text-xs text-gray-400">{r.check_in_time || '--'} → {r.check_out_time || '--'}</p>
                    </div>
                    <div className="text-left">
                      <span className={`badge badge-${r.status === 'present' ? 'present' : r.status === 'late' ? 'late' : 'absent'}`}>
                        {r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : 'غائب'}
                      </span>
                      {r.late_minutes > 0 && (
                        <p className="text-xs text-amber-500 mt-1 text-center">{r.late_minutes} د</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    )
  }

  // Employees List
  return (
    <AdminLayout title="الموظفين" subtitle={`${employees.length} موظف`}>
      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          className="input-field pr-11"
          placeholder="ابحث بالاسم أو الكود أو القسم..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">لا يوجد موظفون</div>
      ) : (
        filtered.map(emp => (
          <button
            key={emp.employee_id}
            onClick={() => selectEmployee(emp)}
            className="card w-full text-right flex items-center gap-3 hover:border-gold-300 dark:hover:border-gold-700 transition-all active:scale-98"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-800 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-black text-lg">{emp.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold dark:text-white">{emp.name}</p>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                {emp.employee_id} · {emp.department || 'بدون قسم'}
              </p>
            </div>
            <div className="text-xs text-left flex-shrink-0">
              <p className="text-gray-400 dark:text-dark-muted">الشيفت</p>
              <p className="font-semibold dark:text-white">{emp.fixed_start_time}–{emp.fixed_end_time}</p>
            </div>
          </button>
        ))
      )}
    </AdminLayout>
  )
}
