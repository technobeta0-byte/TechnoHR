import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { getLocation } from '../utils/location'
import { registerWebAuthn } from '../utils/webauthn'
import { EmployeeLayout } from '../components/Layout'
import { FiCheckCircle, FiXCircle, FiMapPin, FiClock, FiAlertCircle, FiRefreshCw, FiShield, FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function EmployeeHome() {
  const { employee } = useStore()
  const [record, setRecord]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [time, setTime]       = useState(new Date())
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveData, setLeaveData] = useState({ start_date: '', end_date: '', leave_type: 'annual', reason: '' })
  const [leaveLoading, setLeaveLoading] = useState(false)

  useEffect(() => {
    loadStatus()
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const loadStatus = async () => {
    try {
      const res = await api.todayStatus(employee.employee_id)
      if (res.success) setRecord(res.data)
    } catch {}
  }

  const handleCheckIn = async () => {
    setLoading(true); setMsg(null)
    try {
      const loc = await getLocation()
      const res = await api.checkIn({
        employee_id: employee.employee_id,
        lat: loc.lat,
        lng: loc.lng,
        method: 'password',
      })
      setMsg({ type: res.success ? 'success' : 'error', text: res.message || res.error })
      if (res.success) {
        setRecord(prev => ({
          ...prev,
          check_in_time: res.check_in_time || format(new Date(), 'HH:mm:ss'),
          status: res.status,
          late_minutes: res.late_minutes || 0
        }))
        loadStatus()
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true); setMsg(null)
    try {
      const res = await api.checkOut({
        employee_id: employee.employee_id,
        method: 'password',
      })
      setMsg({ type: res.success ? 'success' : 'error', text: res.message || res.error })
      if (res.success) {
        setRecord(prev => ({
          ...prev,
          check_out_time: res.check_out_time || format(new Date(), 'HH:mm:ss'),
          total_hours: res.total_hours || 0
        }))
        loadStatus()
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterBio = async () => {
    setBioLoading(true); setMsg(null)
    try {
      const credId = await registerWebAuthn(employee.employee_id, employee.name)
      const res = await api.saveWebAuthn(employee.employee_id, credId)
      if (res.success) {
        setMsg({ type: 'success', text: 'تم تسجيل البصمة/الوجه بنجاح لهذا الجهاز! ✅' })
      } else {
        setMsg({ type: 'error', text: res.error || 'فشل حفظ البصمة في السيرفر' })
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setBioLoading(false)
    }
  }

  const handleRequestLeave = async (e) => {
    e.preventDefault()
    setLeaveLoading(true); setMsg(null)
    try {
      const res = await api.requestLeave({
        employee_id: employee.employee_id,
        ...leaveData
      })
      if (res.success) {
        setMsg({ type: 'success', text: res.message })
        setShowLeaveModal(false)
      } else {
        setMsg({ type: 'error', text: res.error })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLeaveLoading(false)
    }
  }

  const hasIn  = !!record?.check_in_time
  const hasOut = !!record?.check_out_time
  const dateStr = format(time, 'EEEE، d MMMM yyyy', { locale: ar })
  const timeStr = format(time, 'HH:mm:ss')

  return (
    <EmployeeLayout title="TechnoHR" subtitle={employee?.name}>
      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* ── Clock Card ─────────────────────────────── */}
        <div className="card text-center space-y-1 border-gold-200 dark:border-gold-800/30 bg-gradient-to-br from-gold-50 to-white dark:from-gold-900/10 dark:to-dark-card">
          <p className="text-gold-600 dark:text-gold-400 text-sm font-semibold">{dateStr}</p>
          <p className="text-5xl font-black text-gray-900 dark:text-white tracking-widest tabular-nums">
            {timeStr}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-dark-muted">
            <FiMapPin className="w-3 h-3" />
            <span>القاهرة</span>
          </div>
        </div>

        {/* ── Status Card ────────────────────────────── */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-500 dark:text-dark-muted">حالة اليوم</h3>
            <button onClick={loadStatus} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors">
              <FiRefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {!hasIn ? (
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-card2 flex items-center justify-center">
                <FiClock className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">لم يتم تسجيل الحضور بعد</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-dark-muted">الحضور</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{record.check_in_time}</p>
                  </div>
                </div>
                {record.late_minutes > 0 && (
                  <span className="badge badge-late">متأخر {record.late_minutes} د</span>
                )}
              </div>

              {hasOut && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiXCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-dark-muted">الانصراف</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{record.check_out_time}</p>
                  </div>
                </div>
              )}

              {hasIn && !hasOut && (
                <div className="flex items-center gap-2 text-sm text-green-500 font-semibold bg-green-50 dark:bg-green-900/20 p-2.5 rounded-xl">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  أنت داخل المكان الآن
                </div>
              )}

              {hasIn && hasOut && (
                <div className="bg-gray-50 dark:bg-dark-card2 rounded-2xl p-3 text-center">
                  <p className="text-xs text-gray-400 dark:text-dark-muted">إجمالي الساعات اليوم</p>
                  <p className="text-2xl font-black gradient-text">{record.total_hours} ساعة</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Message ────────────────────────────────── */}
        {msg && (
          <div className={`rounded-2xl p-4 text-sm font-semibold text-center flex items-center justify-center gap-2 animate-fade-in ${
            msg.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {msg.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {msg.text}
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────── */}
        {!hasIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="btn-gold text-lg py-5 animate-pulse-gold cursor-pointer"
          >
            {loading
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FiCheckCircle className="w-6 h-6" /> تسجيل الحضور</>}
          </button>
        )}

        {hasIn && !hasOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="btn-blue text-lg py-5 cursor-pointer"
          >
            {loading
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FiXCircle className="w-6 h-6" /> تسجيل الانصراف</>}
          </button>
        )}

        {hasIn && hasOut && (
          <div className="card text-center py-6 space-y-2 border-green-200 dark:border-green-800/30">
            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-bold text-lg text-gray-900 dark:text-white">تم تسجيل يومك كاملاً ✅</p>
          </div>
        )}

        {/* ── Quick Actions ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRegisterBio}
            disabled={bioLoading}
            className="card flex flex-col items-center justify-center p-4 gap-2 hover:border-gold-500 transition-all text-center cursor-pointer"
          >
            <FiShield className="w-6 h-6 text-gold-500" />
            <span className="text-xs font-bold dark:text-white">ربط البصمة / Face ID</span>
          </button>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="card flex flex-col items-center justify-center p-4 gap-2 hover:border-gold-500 transition-all text-center cursor-pointer"
          >
            <FiCalendar className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-bold dark:text-white">طلب إجازة جديدة</span>
          </button>
        </div>

        {/* ── Employee Info ───────────────────────────── */}
        <div className="card space-y-3">
          <h3 className="font-bold text-sm text-gray-500 dark:text-dark-muted">معلوماتي</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="الشيفت" value={`${employee?.fixed_start_time || '--'} - ${employee?.fixed_end_time || '--'}`} />
            <InfoBox label="نوع الشيفت" value={
              employee?.shift_type === 'fixed' ? 'ثابت'
              : employee?.shift_type === 'flexible' ? 'مرن'
              : 'مختلط'
            } />
            <InfoBox label="رصيد الإجازات السنوي" value={`${employee?.annual_leave_days || 21} يوم`} />
            <InfoBox label="القسم" value={employee?.department || 'غير محدد'} />
          </div>
        </div>

        {/* ── Modal Request Leave ───────────────────────────── */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-white dark:bg-dark-card space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-3">
                <h3 className="font-bold text-lg dark:text-white">طلب إجازة جديدة</h3>
                <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
              </div>

              <form onSubmit={handleRequestLeave} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1 block">تاريخ البداية</label>
                  <input type="date" required className="input-field" value={leaveData.start_date} onChange={e => setLeaveData({...leaveData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1 block">تاريخ النهاية</label>
                  <input type="date" required className="input-field" value={leaveData.end_date} onChange={e => setLeaveData({...leaveData, end_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1 block">نوع الإجازة</label>
                  <select className="input-field" value={leaveData.leave_type} onChange={e => setLeaveData({...leaveData, leave_type: e.target.value})}>
                    <option value="annual">سنوية (تخصم من الرصيد)</option>
                    <option value="unpaid">بدون مرتب (تخصم من الراتب)</option>
                    <option value="sick">مرضية</option>
                    <option value="emergency">طارئة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1 block">السبب (اختياري)</label>
                  <textarea className="input-field h-20" placeholder="اكتب سبب طلب الإجازة..." value={leaveData.reason} onChange={e => setLeaveData({...leaveData, reason: e.target.value})} />
                </div>

                <button type="submit" disabled={leaveLoading} className="btn-gold">
                  {leaveLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'إرسال الطلب للأدمن'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </EmployeeLayout>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-dark-card2 rounded-2xl p-3">
      <p className="text-xs text-gray-400 dark:text-dark-muted">{label}</p>
      <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  )
}
