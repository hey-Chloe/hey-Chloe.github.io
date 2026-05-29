'use client'

import { create } from 'zustand'

type UIState = {
  adminSidebarOpen: boolean
  glowEnabled: boolean
  toggleSidebar: () => void
  toggleGlow: () => void
}

export const useUIStore = create<UIState>((set) => ({
  adminSidebarOpen: true,
  glowEnabled: true,
  toggleSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
  toggleGlow: () => set((state) => ({ glowEnabled: !state.glowEnabled }))
}))
