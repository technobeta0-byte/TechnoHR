const API_URL = 'https://script.google.com/macros/s/AKfycbx5NXUle-IZohKahut8X3WM-mREZKAd68UG4dfaaBI-3Pw2R9vi0fHZKXqFq-1c9nqv/exec'

async function callGet(params) {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API_URL}?${query}`, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    })
    return await res.json()
  } catch (err) {
    console.error('API GET Error:', err)
    return { success: false, error: 'تعذر الاتصال بـ Google Apps Script - تحقق من الإعدادات أو الإنترنت' }
  }
}

async function callPost(body) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (err) {
    console.error('API POST Error:', err)
    return { success: false, error: 'تعذر ارسال البيانات لـ Google Apps Script' }
  }
}

export const api = {
  getSettings:    ()                              => callGet({ action: 'get_settings' }),
  verifyAdmin:    (password)                      => callPost({ action: 'verify_admin', password }),
  getEmployees:   (token)                         => callGet({ action: 'get_employees', admin_token: token }),
  loginEmployee:  (id, pass, method, extra = {})  => callPost({ action: 'login_employee', employee_id: id, password: pass, method, ...extra }),
  checkIn:        (body)                          => callPost({ action: 'check_in', ...body }),
  checkOut:       (body)                          => callPost({ action: 'check_out', ...body }),
  todayStatus:    (id)                            => callGet({ action: 'today_status', employee_id: id }),
  getAttendance:  (id, month)                     => callGet({ action: 'get_attendance', employee_id: id, month }),
  getReport:      (id, month, token)              => callGet({ action: 'get_report', employee_id: id, month, admin_token: token }),
  calcPayroll:    (month, token)                  => callPost({ action: 'calculate_payroll', month, admin_token: token }),
  getPayroll:     (month, token)                  => callGet({ action: 'get_payroll', month, admin_token: token }),
  getDashboard:   (token)                         => callGet({ action: 'get_dashboard', admin_token: token }),
  requestLeave:   (body)                          => callPost({ action: 'request_leave', ...body }),
  approveLeave:   (leave_id, action, token)       => callPost({ action: 'approve_leave', leave_id, action, admin_token: token }),
  getLeaves:      (token, empId = '')             => callGet({ action: 'get_leaves', admin_token: token, employee_id: empId }),
  saveWebAuthn:   (emp_id, cred_id)               => callPost({ action: 'save_webauthn', employee_id: emp_id, credential_id: cred_id }),
  updateSettings: (token, updates)                => callPost({ action: 'update_settings', admin_token: token, updates }),
}
