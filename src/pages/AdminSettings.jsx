import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { AdminLayout } from '../components/Layout'
import { FiSave, FiMapPin } from 'react-icons/fi'
import { getLocation } from '../utils/location'

export default function AdminSettings() {
  const { adminToken, setSettings } = useStore()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [locLoading, setLocLoading] = useState(false)

  useEffect(() => {
    api.getSettings().then(res => { if (res.success) { setSettings(res.data); setForm(res.data) } })
  }, [])

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await api.updateSettings(adminToken, form)
      if (res.success) { setMsg({ type:'success', text:'تم الحفظ بنجاح ✅' }); setSettings(form) }
      else setMsg({ type:'error', text: res.error })
    } catch (e) { setMsg({ type:'error', text: e.message }) }
    finally { setSaving(false) }
  }

  const getMyLocation = async () => {
    setLocLoading(true)
    try {
      const loc = await getLocation()
      setForm(f => ({ ...f, lat: loc.lat.toFixed(6), lng: loc.lng.toFixed(6) }))
    } catch (e) { setMsg({ type:'error', text: e.message }) }
    finally { setLocLoading(false) }
  }

  const F = (key, label, type='text', placeholder='') => (
    <div>
      <label className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1 block">{label}</label>
      <input type={type} className="input-field" placeholder={placeholder || label}
        value={form[key] || ''} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
    </div>
  )

  return (
    <AdminLayout title="الإعدادات" subtitle="Branch Settings">
      <div className="space-y-5">
        <div className="card space-y-4">
          <h3 className="font-bold dark:text-white">🏪 معلومات الفرع</h3>
          {F('branch_name', 'اسم الفرع')}
          {F('logo_url', 'رابط اللوجو (Drive link)')}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold dark:text-white">📍 الموقع الجغرافي</h3>
            <button onClick={getMyLocation} disabled={locLoading}
              className="flex items-center gap-1 text-xs text-gold-600 font-bold bg-gold-50 dark:bg-gold-900/20 px-3 py-1.5 rounded-xl">
              {locLoading ? '...' : <><FiMapPin className="w-3 h-3" />موقعي الحالي</>}
            </button>
          </div>
          {F('lat', 'خط العرض (Latitude)', 'number', '30.0444')}
          {F('lng', 'خط الطول (Longitude)', 'number', '31.2357')}
          {F('radius_meters', 'نطاق التسجيل (متر)', 'number', '100')}
        </div>

        <div className="card space-y-4">
          <h3 className="font-bold dark:text-white">⏰ إعدادات العمل</h3>
          {F('work_start_default', 'بداية الشيفت الافتراضي', 'time')}
          {F('work_end_default', 'نهاية الشيفت الافتراضي', 'time')}
          {F('late_grace_minutes', 'دقائق السماح', 'number', '15')}
          {F('deduction_per_minute', 'خصم لكل دقيقة تأخير (جنيه)', 'number', '0.5')}
          {F('overtime_rate_multiplier', 'معامل الأوفر تايم', 'number', '1.5')}
        </div>

        <div className="card space-y-4">
          <h3 className="font-bold dark:text-white">🔐 الأمان</h3>
          {F('admin_username', 'اسم مستخدم الأدمن')}
          {F('admin_password', 'باسورد الأدمن الجديد', 'password')}
        </div>

        {msg && (
          <div className={`rounded-2xl p-3 text-sm text-center font-semibold ${
            msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'
          }`}>{msg.text}</div>
        )}

        <button onClick={save} disabled={saving} className="btn-gold">
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave />حفظ الإعدادات</>}
        </button>
      </div>
    </AdminLayout>
  )
}
