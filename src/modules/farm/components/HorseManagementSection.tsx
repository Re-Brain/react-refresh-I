import type { Dispatch, SetStateAction } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import type { Horse } from '../api/horse'
import HorseTable from './HorseTable'

type HorseManagementSectionProps = {
  horses: Horse[]
  setHorses: Dispatch<SetStateAction<Horse[]>>
  horsesError: string | null
  onRetry: () => void
  onAddHorse: () => void
  addingHorse?: boolean
  addHorseError?: string | null
}

// Horse Management tab: the horse table plus an "Add Horse" button, or a retry
// panel when the horses failed to load.
function HorseManagementSection({
  horses,
  setHorses,
  horsesError,
  onRetry,
  onAddHorse,
  addingHorse = false,
  addHorseError = null,
}: HorseManagementSectionProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl xs:text-2xl font-bold text-brand-gold">Horse Management</h2>
        <button
          onClick={onAddHorse}
          disabled={addingHorse}
          className="flex items-center gap-2 bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> {addingHorse ? 'Creating...' : 'Add Horse'}
        </button>
      </div>
      {addHorseError && <p className="text-red-600 text-sm mb-4">{addHorseError}</p>}
      {horsesError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <p>{horsesError}</p>
          </div>
          <button
            onClick={onRetry}
            className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm shrink-0"
          >
            Retry
          </button>
        </div>
      ) : (
        <HorseTable horses={horses} onChange={setHorses} />
      )}
    </div>
  )
}

export default HorseManagementSection
