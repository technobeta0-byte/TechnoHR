import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { FiLock, FiLogIn } from 'react-icons/fi'

export default function AdminLogin() {
  const [pass, setPass]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { setAdminToken, isDark } = useStore()
  const navigate = useNavigate()

  const login = async () => {
    if (!pass.trim()) { setError('أدخل الباسورد'); return }
    setLoading(true); setError('')
    try {
      const res = await api.verifyAdmin(pass)
      if (res.success) {
        setAdminToken(res.token)
        navigate('/admin')
      } else {
        setError(res.error || 'باسورد غلط ❌')
      }
    } catch {
      setError('خطأ في الاتصال - تحقق من الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-gold-900 via-gold-700 to-gold-500 px-6 pt-16 pb-20 text-center">
        <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-3">
          <FiLock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white">Admin Panel</h1>
        <p className="text-gold-100 text-xs mt-1">TechnoHR by TechnoBeta</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 -mt-12">
        <div className="card animate-slide-up space-y-4">
          <h2 className="font-bold text-lg dark:text-white">تسجيل دخول الأدمن</h2>

          <input
            type="password"
            className="input-field text-base"
            placeholder="🔐 الباسورد"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            autoFocus
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-3 text-sm text-center">
              {error}
            </div>
          )}

          <button onClick={login} disabled={loading} className="btn-gold">
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FiLogIn /> دخول</>}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="text-center w-full text-sm text-gray-400 dark:text-dark-muted hover:text-gold-500 transition-colors"
          >
            → دخول الموظف
          </button>
        </div>
      </div>
    </div>
  )
}
