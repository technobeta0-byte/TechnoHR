import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { api } from '../api/sheets'
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

export default function Setup() {
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [error, setError]   = useState('')
  const { initTheme, isDark, toggleTheme, setSettings } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    initTheme()
    tryConnect()
  }, [])

  const tryConnect = async () => {
    setStatus('loading')
    setError('')
    try {
      const res = await api.getSettings()
      if (res.success) {
        setSettings(res.data)
        setStatus('ok')
        setTimeout(() => navigate('/login'), 1200)
      } else {
        setStatus('error')
        setError('فشل الاتصال بـ Google Sheets: ' + (res.error || 'خطأ غير معروف'))
      }
    } catch (e) {
      setStatus('error')
      setError('تعذر الاتصال - تحقق من اتصال الإنترنت وإعدادات الـ Apps Script')
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-dark-bg ${isDark ? 'dark' : ''}`}>
      <div className="w-full max-w-xs text-center space-y-8 animate-fade-in">

        {/* Logo */}
        <div className="space-y-3">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 bg-gradient-to-br from-gold-700 via-gold-500 to-gold-300 rounded-3xl flex items-center justify-center shadow-2xl gold-glow">
              <span className="text-5xl font-black text-white">T</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black gradient-text">TechnoHR</h1>
            <p className="text-dark-muted text-sm mt-1">by TechnoBeta</p>
          </div>
        </div>

        {/* Status */}
        {status === 'loading' && (
          <div className="space-y-3 animate-fade-in">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-dark-muted text-sm">جارٍ الاتصال بقاعدة البيانات...</p>
          </div>
        )}

        {status === 'ok' && (
          <div className="space-y-2 animate-fade-in">
            <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <p className="text-green-400 font-bold text-lg">تم الاتصال بنجاح ✅</p>
            <p className="text-dark-muted text-sm">جارٍ التحويل...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button onClick={tryConnect} className="btn-gold">
              <FiRefreshCw className="w-4 h-4" /> إعادة المحاولة
            </button>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-xs text-dark-muted hover:text-gold-400 transition-colors"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>
  )
}
