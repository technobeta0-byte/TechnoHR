import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────────────────────────
      isDark: true,
      toggleTheme: () => {
        const d = !get().isDark
        set({ isDark: d })
        document.documentElement.classList.toggle('dark', d)
      },
      initTheme: () => {
        document.documentElement.classList.toggle('dark', get().isDark)
      },

      // ── Admin ──────────────────────────────────────────
      adminToken: null,
      setAdminToken: (token) => set({ adminToken: token }),
      logoutAdmin:   ()      => set({ adminToken: null }),

      // ── Employee ───────────────────────────────────────
      employee: null,
      setEmployee: (emp) => set({ employee: emp }),
      logoutEmployee: () => set({ employee: null, todayRecord: null, todayRecordDate: null }),

      // ── Settings cache ─────────────────────────────────
      settings: null,
      setSettings: (s) => set({ settings: s }),

      // ── Location (session only) ────────────────────────
      userLocation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),

      // ── Today Record - Persistent ─────────────────────
      // يتحفظ في localStorage بحيث لو الموظف أغلق التطبيق وفتحه
      // يلاقي حالته (حاضر / مسجل انصراف) من أول ثانية بدون انتظار API
      todayRecord: null,
      todayRecordDate: null,

      setTodayRecord: (record) => {
        const today = new Date().toISOString().slice(0, 10)
        set({ todayRecord: record, todayRecordDate: today })
      },

      // يرجع الـ record المحفوظ لو كان بتاع نهارده فقط
      getTodayRecordIfFresh: () => {
        const state = get()
        const today = new Date().toISOString().slice(0, 10)
        if (state.todayRecordDate === today && state.todayRecord) {
          return state.todayRecord
        }
        // لو البيانات بتاعة إمبارح أو أقدم، امسحها
        if (state.todayRecordDate && state.todayRecordDate !== today) {
          set({ todayRecord: null, todayRecordDate: null })
        }
        return null
      },

      clearTodayRecord: () => set({ todayRecord: null, todayRecordDate: null }),
    }),
    {
      name: 'technohr-v2',
      // احفظ: الثيم + سجل اليوم + تاريخه
      // لا تحفظ: tokens، employee، settings (أمان)
      partialize: (state) => ({
        isDark:          state.isDark,
        todayRecord:     state.todayRecord,
        todayRecordDate: state.todayRecordDate,
      }),
    }
  )
)
