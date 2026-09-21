import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { readNFC } from '../utils/nfc'
import { verifyWebAuthn } from '../utils/webauthn'
import { FiUser, FiLock, FiLogIn, FiCreditCard, FiShield } from 'react-icons/fi'

const METHODS = [
  { k: 'password',  icon: FiLock,       ar: 'باسورد' },
  { k: 'nfc',       icon: FiCreditCard, ar: 'NFC كارت' },
  { k: 'biometric', icon: FiShield,     ar: 'بصمة / Face ID' },
]

export default function EmployeeLogin() {
  const [empId, setEmpId]     = useState('')
  const [pass, setPass]       = useState('')
  const [method, setMethod]   = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [info, setInfo]       = useState('')
  const { setEmployee, isDark } = useStore()
  const navigate = useNavigate()

  const doLogin = async (m, extra = {}) => {
    if (!empId.trim() && m !== 'nfc') { setError('أدخل كود الموظف'); return }
    setLoading(true); setError(''); setInfo('')
    try {
      const res = await api.loginEmployee(empId.trim().toUpperCase(), pass, m, extra)
      if (res.success) {
        setEmployee(res.employee)
        navigate('/home')
      } else {
        setError(res.error || 'بيانات الدخول غير صحيحة ❌')
      }
    } catch {
      setError('خطأ في الاتصال - تحقق من الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  const handleNFC = async () => {
    setLoading(true); setError(''); setInfo('قرّب الكارت من الجهاز...')
    try {
      const cardId = await readNFC()
      setInfo('')
      await doLogin('nfc', { nfc_id: cardId })
    } catch (e) {
      setInfo(''); setError(e.message); setLoading(false)
    }
  }

  const handleBiometric = async () => {
    if (!empId.trim()) { setError('أدخل كود الموظف أولاً'); return }
    setLoading(true); setError(''); setInfo('جارٍ التحقق البيومتري...')
    try {
      // اجيب credential_id للموظف ده
      const res = await api.loginEmployee(empId.trim().toUpperCase(), '', 'get_credential', {})
      if (!res.success) { setError(res.error || 'الموظف غير موجود'); setLoading(false); setInfo(''); return }
      const credId = res.webauthn_credential
      if (!credId) {
        setError('لم يتم تسجيل البصمة لهذا الموظف - راجع الأدمن')
        setLoading(false); setInfo(''); return
      }
      const verified = await verifyWebAuthn(credId)
      if (verified) {
        setEmployee(res.employee)
        navigate('/home')
      } else {
        setError('فشل التحقق البيومتري - حاول مرة أخرى')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false); setInfo('')
    }
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-gold-800 via-gold-600 to-gold-400 px-6 pt-14 pb-20 text-center">
        <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <span className="text-3xl font-black text-white">T</span>
        </div>
        <h1 className="text-2xl font-black text-white">TechnoHR</h1>
        <p className="text-gold-100 text-xs mt-1">by TechnoBeta</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-5 -mt-12 pb-6">
        <div className="card animate-slide-up space-y-5">
          <h2 className="font-bold text-lg dark:text-white">تسجيل دخول الموظف</h2>

          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-dark-card2 rounded-2xl p-1">
            {METHODS.map(({ k, icon: Icon, ar }) => (
              <button
                key={k}
                onClick={() => { setMethod(k); setError(''); setInfo('') }}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  method === k
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-gray-500 dark:text-dark-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {ar}
              </button>
            ))}
          </div>

          {/* Employee ID - shown for password + biometric */}
          {method !== 'nfc' && (
            <div className="relative">
              <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none" />
              <input
                className="input-field pr-11"
                placeholder="كود الموظف (مثلاً: EMP001)"
                value={empId}
                onChange={e => setEmpId(e.target.value.toUpperCase())}
              />
            </div>
          )}

          {/* Password field */}
          {method === 'password' && (
            <div className="relative">
              <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none" />
              <input
                type="password"
                className="input-field pr-11"
                placeholder="الباسورد"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doLogin('password')}
              />
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-3 text-sm text-center">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-2xl p-3 text-sm text-center animate-pulse">
              📡 {info}
            </div>
          )}

          {/* Action Buttons */}
          {method === 'password' && (
            <button onClick={() => doLogin('password')} disabled={loading} className="btn-gold">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><FiLogIn /> دخول</>}
            </button>
          )}

          {method === 'nfc' && (
            <button onClick={handleNFC} disabled={loading} className="btn-gold">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><FiCreditCard /> قرّب الكارت</>}
            </button>
          )}

          {method === 'biometric' && (
            <button onClick={handleBiometric} disabled={loading} className="btn-gold animate-pulse-gold">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><FiShield /> بصمة / Face ID</>}
            </button>
          )}

          <button
            onClick={() => navigate('/admin-login')}
            className="text-center w-full text-xs text-gray-400 dark:text-dark-muted hover:text-gold-500 transition-colors"
          >
            دخول الأدمن ←
          </button>
        </div>
      </div>
    </div>
  )
}
