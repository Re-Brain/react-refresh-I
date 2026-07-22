import { useState } from 'react'
import { X } from 'lucide-react'
import type { Horse } from '../api/horse'
import {
  PERIODS,
  saveHorsePeriods,
  type Period,
} from '../api/availability'

type PeriodsByHorse = Record<number, Period[]>

const samePeriods = (a: Period[], b: Period[]) =>
  a.length === b.length && a.every((p, i) => p === b[i])

const periodsFromHorses = (horses: Horse[]): PeriodsByHorse =>
  Object.fromEntries(horses.map(h => [h.id, h.periods ?? []]))

// Which periods each horse takes part in. Read-only until the farmer clicks
// Edit. A period the farm has closed (not in `openPeriods`) is disabled here for
// every horse. The farm's schedule (FarmAvailabilityEditor) owns the times.
// Initial periods come from the horse objects (the API returns them per horse).
function HorsePeriodsGrid({
  horses,
  openPeriods,
}: {
  horses: Horse[]
  openPeriods: Period[]
}) {
  // `committed` is what's saved; `draft` is the working copy while editing.
  const [committed, setCommitted] = useState<PeriodsByHorse>(() => periodsFromHorses(horses))
  const [draft, setDraft] = useState<PeriodsByHorse>(committed)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Re-sync from the horses prop when it changes (e.g. the dashboard finishes
  // loading them) — adjusting state during render rather than in an effect, and
  // never clobbering an in-progress edit. After a save `committed` diverges from
  // the (possibly stale) prop until the parent refetches, so this only runs when
  // the prop reference actually changes.
  const [syncedHorses, setSyncedHorses] = useState(horses)
  if (horses !== syncedHorses && !isEditing) {
    setSyncedHorses(horses)
    const next = periodsFromHorses(horses)
    setCommitted(next)
    setDraft(next)
  }

  function toggle(horseId: number, period: Period) {
    setDraft(prev => {
      const current = prev[horseId] ?? []
      const next = current.includes(period)
        ? current.filter(p => p !== period)
        : PERIODS.map(p => p.key).filter(p => p === period || current.includes(p)) // keep order
      return { ...prev, [horseId]: next }
    })
  }

  function handleEdit() {
    setDraft(committed)
    setSaveError(null)
    setIsEditing(true)
  }

  function handleCancel() {
    setDraft(committed)
    setSaveError(null)
    setIsEditing(false)
  }

  async function handleSave() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setSaving(true)
    setSaveError(null)
    try {
      // Only PUT the horses whose periods actually changed.
      await Promise.all(
        horses
          .filter(h => !samePeriods(committed[h.id] ?? [], draft[h.id] ?? []))
          .map(h => saveHorsePeriods(token, h.id, draft[h.id] ?? []))
      )
      setCommitted(draft)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (horses.length === 0) {
    return (
      <p className="text-brand-muted text-sm">
        Add a horse first, then choose which periods it can be visited in.
      </p>
    )
  }

  const view = isEditing ? draft : committed

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
            >
              <X size={14} /> Cancel
            </button>
          </>
        )}
      </div>

      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

      <div className="overflow-x-auto rounded-lg border border-brand-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
              <th className="text-left px-4 py-3 font-bold">Horse</th>
              {PERIODS.map(p => {
                const closed = !openPeriods.includes(p.key)
                return (
                  <th
                    key={p.key}
                    className={`px-4 py-3 font-bold text-center ${closed ? 'opacity-40' : ''}`}
                    title={closed ? 'Closed in the farm schedule' : undefined}
                  >
                    {p.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {horses.map(horse => {
              const periods = view[horse.id] ?? []
              return (
                <tr key={horse.id} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-3 font-bold text-brand-text">{horse.name}</td>
                  {PERIODS.map(p => {
                    const farmOpen = openPeriods.includes(p.key)
                    return (
                      <td key={p.key} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          // A period the farm has closed is off for every horse;
                          // checkboxes are only editable in edit mode.
                          checked={farmOpen && periods.includes(p.key)}
                          disabled={!isEditing || !farmOpen || saving}
                          onChange={() => toggle(horse.id, p.key)}
                          aria-label={`${horse.name} — ${p.label}`}
                          className="h-4 w-4 accent-brand-gold disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer"
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HorsePeriodsGrid
