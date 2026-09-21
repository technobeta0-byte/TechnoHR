import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  FiSun, FiMoon, FiLogOut, FiChevronLeft,
  FiHome, FiUsers, FiClock, FiDollarSign, FiCalendar, FiSettings,
} from 'react-icons/fi'

// ── TopBar ─────────────────────────────────────────────────────────────────
export function TopBar({ title, subtitle, backTo, showLogout, onLogout, extra }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useStore()

  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-dark-card2 transition-colors flex-shrink-0"
            >
              <FiChevronLeft className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-base text-gray-900 dark:text-white leading-none truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gold-600 dark:text-gold-400 mt-0.5 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {extra}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors"
          >
            {isDark
              ? <FiSun  className="w-4 h-4 text-gold-400" />
              : <FiMoon className="w-4 h-4 text-gray-500" />}
          </button>
          {showLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <FiLogOut className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Admin Nav ──────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/admin',            icon: FiHome,       ar: 'الرئيسية' },
  { to: '/admin/employees',  icon: FiUsers,      ar: 'الموظفين' },
  { to: '/admin/attendance', icon: FiClock,      ar: 'الحضور'   },
  { to: '/admin/payroll',    icon: FiDollarSign, ar: 'الرواتب'  },
  { to: '/admin/leaves',     icon: FiCalendar,   ar: 'الإجازات' },
  { to: '/admin/settings',   icon: FiSettings,   ar: 'الإعدادات'},
]

export function AdminLayout({ children, title, subtitle, extra }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutAdmin } = useStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <TopBar
        title={title}
        subtitle={subtitle}
        extra={extra}
        showLogout
        onLogout={() => { logoutAdmin(); navigate('/admin-login') }}
      />
      <main className="flex-1 overflow-auto pb-24 px-4 pt-4 space-y-4 animate-fade-in">
        {children}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border z-50">
        <div className="grid grid-cols-6 pb-safe">
          {ADMIN_NAV.map(({ to, icon: Icon, ar }) => {
            const active = location.pathname === to
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                  active
                    ? 'text-gold-600 dark:text-gold-400'
                    : 'text-gray-400 dark:text-dark-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.9)]' : ''}`} />
                <span className="text-[9px] font-bold">{ar}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// ── Employee Layout ────────────────────────────────────────────────────────
const EMP_NAV = [
  { to: '/home',      icon: FiHome,  ar: 'الرئيسية' },
  { to: '/my-report', icon: FiClock, ar: 'تقاريري'  },
]

export function EmployeeLayout({ children, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutEmployee } = useStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <TopBar
        title={title}
        subtitle={subtitle}
        showLogout
        onLogout={() => { logoutEmployee(); navigate('/login') }}
      />
      <main className="flex-1 overflow-auto pb-24 animate-fade-in">
        {children}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border z-50">
        <div className="grid grid-cols-2 pb-safe">
          {EMP_NAV.map(({ to, icon: Icon, ar }) => {
            const active = location.pathname === to
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center py-3 gap-1 transition-colors ${
                  active
                    ? 'text-gold-600 dark:text-gold-400'
                    : 'text-gray-400 dark:text-dark-muted'
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_6px_rgba(212,175,55,0.8)]' : ''}`} />
                <span className="text-xs font-bold">{ar}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
