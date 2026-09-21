import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'

import Setup           from './pages/Setup'
import AdminLogin      from './pages/AdminLogin'
import AdminDashboard  from './pages/AdminDashboard'
import AdminEmployees  from './pages/AdminEmployees'
import AdminAttendance from './pages/AdminAttendance'
import AdminPayroll    from './pages/AdminPayroll'
import AdminLeaves     from './pages/AdminLeaves'
import AdminSettings   from './pages/AdminSettings'
import EmployeeLogin   from './pages/EmployeeLogin'
import EmployeeHome    from './pages/EmployeeHome'
import EmployeeReport  from './pages/EmployeeReport'

function RequireAdmin({ children }) {
  const adminToken = useStore(s => s.adminToken)
  return adminToken ? children : <Navigate to="/admin-login" replace />
}

function RequireEmployee({ children }) {
  const employee = useStore(s => s.employee)
  return employee ? children : <Navigate to="/login" replace />
}

export default function App() {
  const initTheme = useStore(s => s.initTheme)
  useEffect(() => { initTheme() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<Setup />} />
        <Route path="/login"            element={<EmployeeLogin />} />
        <Route path="/admin-login"      element={<AdminLogin />} />

        <Route path="/home"             element={<RequireEmployee><EmployeeHome /></RequireEmployee>} />
        <Route path="/my-report"        element={<RequireEmployee><EmployeeReport /></RequireEmployee>} />

        <Route path="/admin"            element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/employees"  element={<RequireAdmin><AdminEmployees /></RequireAdmin>} />
        <Route path="/admin/attendance" element={<RequireAdmin><AdminAttendance /></RequireAdmin>} />
        <Route path="/admin/payroll"    element={<RequireAdmin><AdminPayroll /></RequireAdmin>} />
        <Route path="/admin/leaves"     element={<RequireAdmin><AdminLeaves /></RequireAdmin>} />
        <Route path="/admin/settings"   element={<RequireAdmin><AdminSettings /></RequireAdmin>} />

        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
