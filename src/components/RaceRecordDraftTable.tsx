import { Plus, Trash2 } from 'lucide-react'
import { GradeBadge, FinishPos, RecordInputCells } from './raceRecordFields'
import type { useHorseRecordDraft } from '../hooks/useHorseRecordDraft'

type RaceRecordDraftTableProps = {
  draft: ReturnType<typeof useHorseRecordDraft>
}

// Race-record table for the add-horse form: added rows plus a persistent draft
// row whose Add button appends it. At least one record is required. State lives
// in useHorseRecordDraft.
function RaceRecordDraftTable({ draft }: RaceRecordDraftTableProps) {
  const { records, recordForm, setRecordForm, recordError, handleAddRecord, removeRecord } = draft

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
      <p className="text-xs font-bold text-brand-muted uppercase">Race Records <span className="text-red-600">*</span></p>
      <p className="text-[12px] text-brand-muted normal-case">At least one race record is required. Fill in a row and click Add. Grade and FP are optional.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse uppercase">
          <thead>
            <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
              <th className="text-left px-3 py-2 font-bold">Date</th>
              <th className="text-left px-3 py-2 font-bold">Course</th>
              <th className="text-left px-3 py-2 font-bold">Race</th>
              <th className="text-left px-3 py-2 font-bold">Grade</th>
              <th className="text-center px-3 py-2 font-bold">FP</th>
              <th className="text-left px-3 py-2 font-bold">Track</th>
              <th className="text-left px-3 py-2 font-bold">Cond.</th>
              <th className="text-left px-3 py-2 font-bold">Dist.</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-brand-border hover:bg-brand-bg/40 transition">
                <td className="px-2 py-1.5"><span className="text-brand-muted whitespace-nowrap">{r.race_date}</span></td>
                <td className="px-2 py-1.5"><span className="text-brand-text">{r.course}</span></td>
                <td className="px-2 py-1.5"><span className="text-brand-text whitespace-nowrap">{r.race_name}</span></td>
                <td className="px-2 py-1.5"><GradeBadge grade={r.grade || null} /></td>
                <td className="px-2 py-1.5 text-center"><FinishPos pos={r.finish_position ?? null} /></td>
                <td className="px-2 py-1.5"><span className="text-brand-muted">{r.track}</span></td>
                <td className="px-2 py-1.5"><span className="text-brand-muted">{r.condition}</span></td>
                <td className="px-2 py-1.5"><span className="text-brand-muted">{r.distance}M</span></td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => removeRecord(i)}
                    className="text-brand-muted hover:text-red-700 transition" title="Remove record">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Persistent draft row */}
            <tr className="border-b border-brand-border bg-brand-bg/40">
              <RecordInputCells form={recordForm} setForm={setRecordForm} />
              <td className="px-2 py-1.5">
                <button type="button" onClick={handleAddRecord}
                  className="flex items-center gap-1 text-xs font-bold bg-brand-gold text-brand-bg px-2 py-1 rounded hover:bg-brand-gold-light transition">
                  <Plus size={12} /> Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {recordError && <p className="text-red-600 text-sm normal-case">{recordError}</p>}
    </div>
  )
}

export default RaceRecordDraftTable
