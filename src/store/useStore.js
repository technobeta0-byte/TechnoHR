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
      logoutEmployee: ()  => set({ employee: null }),

      // ── Settings cache ─────────────────────────────────
      settings: null,
      setSettings: (s) => set({ settings: s }),

      // ── Location (session only) ────────────────────────
      userLocation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),
    }),
    {
      name: 'technohr-v1',
      // احفظ الثيم فقط في localStorage - لا tokens لأسباب أمنية
      partialize: (state) => ({ isDark: state.isDark }),
    }
  )
)
