'use client'

import { useMemo } from 'react'
import { useUIStore } from '@/stores/use-ui-store'

const pastel = ['#ff9ad8', '#b69bff', '#92ddff', '#ffd1ec']

export function SoftParticles() {
  const glowEnabled = useUIStore((state) => state.glowEnabled)
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        top: (index * 53) % 100,
        size: 5 + ((index * 7) % 16),
        delay: (index % 9) * 0.65,
        color: pastel[index % pastel.length]
      })),
    []
  )

  if (!glowEnabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="soft-grid absolute inset-0 opacity-70" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full blur-[1px] animate-particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${7 + (particle.id % 6)}s`
          }}
        />
      ))}
    </div>
  )
}
