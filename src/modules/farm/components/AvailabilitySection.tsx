import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { Farm } from '../api/farm'
import type { Horse } from '../api/horse'
import { PERIODS, type FarmAvailability, type Period } from '../api/availability'
import FarmAvailabilityEditor from './FarmAvailabilityEditor'
import HorsePeriodsGrid from './HorsePeriodsGrid'

type AvailabilitySectionProps = {
  farm: Farm | null
  horses: Horse[]
  horsesError: string | null
  onRetryHorses: () => void
}

// Visit Availability tab: the farm's weekly schedule editor, then a grid for
// picking which periods each horse can be met in. The editor reports the live
// schedule via onChange; the open periods drive which columns the grid enables.
function AvailabilitySection({ farm, horses, horsesError, onRetryHorses }: AvailabilitySectionProps) {
  const [farmAvail, setFarmAvail] = useState<FarmAvailability | null>(null)
  const openPeriods: Period[] = farmAvail
    ? PERIODS.filter(p => farmAvail.periods[p.key].open).map(p => p.key)
    : []

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-gold mb-6">Visit Availability</h2>
      <p className="text-brand-muted text-sm mb-6">
        Set your farm&rsquo;s visiting days and time slots once, then choose which
        periods each horse can be met in. These settings drive the public booking page.
      </p>

      {farm && <FarmAvailabilityEditor onChange={setFarmAvail} />}

      <div className="mt-8">
        <h3 className="text-lg font-bold text-brand-text mb-1">Which horses, which periods</h3>
        <p className="text-brand-muted text-sm mb-4">
          Each horse can be met during the periods ticked below (using the farm&rsquo;s
          times above). Untick all to make a horse unavailable for visits.
        </p>
        {horsesError ? (
          <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <p>{horsesError}</p>
            </div>
            <button
              onClick={onRetryHorses}
              className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm shrink-0"
            >
              Retry
            </button>
          </div>
        ) : (
          <HorsePeriodsGrid horses={horses} openPeriods={openPeriods} />
        )}
      </div>
    </div>
  )
}

export default AvailabilitySection
