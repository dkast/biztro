"use client"

import { Gauge } from "@suyalcinkaya/gauge"

export default function OnboardingProgress({ progres }: { progres: number }) {
  return (
    <div className="flex flex-row items-center gap-4 px-4">
      <span className="text-gray-500 dark:text-gray-400">Progreso</span>
      <Gauge
        value={progres}
        size="xs"
        showAnimation
        primary="#16a34a"
        secondary="#bce3c6"
      />
    </div>
  )
}
