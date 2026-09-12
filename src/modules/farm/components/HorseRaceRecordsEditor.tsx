import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Horse, RaceRecord } from '../api/horse'
import { GradeBadge, FinishPos, RecordInputCells } from './raceRecordFields'
import type { useHorseRaceRecords } from '../hooks/useHorseRaceRecords'

type HorseRaceRecordsEditorProps = {
  horse: Horse
  races: ReturnType<typeof useHorseRaceRecords>
  /** True when another section is being edited or an image action is in flight. */
  locked: boolean
  /** True while an image action is in flight (drives the Edit button's tooltip). */
  imageBusy: boolean
}

// Race-record card: a table of races that, in edit mode, allows inline edit,
// delete-confirm, and adding a new row. All state and CRUD logic live in the
// useHorseRaceRecords hook; this renders it. Records show most recent first.
function HorseRaceRecordsEditor({ horse, races, locked, imageBusy }: HorseRaceRecordsEditorProps) {
  const {
    isEditingRaces,
    setIsEditingRaces,
    editingRecordId,
    recordForm,
    setRecordForm,
    savingRecord,
    recordError,
    deleteRecordConfirmId,
    setDeleteRecordConfirmId,
    handleEditRecord,
    handleSaveRecord,
    handleCancelRecord,
    handleAddRecord,
    handleCreateRecord,
    handleDeleteRecord,
  } = races

  const sortedRecords = [...horse.race_records].sort(
    (a, b) => b.race_date.localeCompare(a.race_date) || b.id - a.id
  )

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-brand-muted uppercase">Race Record</p>
        {!isEditingRaces ? (
          <button
            type="button"
            onClick={() => setIsEditingRaces(true)}
            disabled={locked}
            className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-gold"
            title={imageBusy ? 'Wait for the image action to finish' : locked ? 'Finish editing horse details first' : 'Edit race records'}
          >
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingRaces(false)}
            disabled={editingRecordId !== null}
            className="flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-text px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
            title={editingRecordId !== null ? 'Finish the open row first' : 'Done editing race records'}
          >
            Done
          </button>
        )}
      </div>
      {/* min-w so this 8-9 column table actually overflows and scrolls
          instead of squeezing every column illegibly at narrow widths; the
          card's own padding already buffers the scroll from the rounded
          corner, so just a fade hint is needed, not a full chrome split. */}
      <div className="overflow-x-auto mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)] lg:mask-none">
        <table className="w-full min-w-200 text-sm border-collapse uppercase">
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
              {isEditingRaces && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((r: RaceRecord) => {
              const editing = editingRecordId === r.id
              return (
                <tr
                  key={r.id}
                  className={`border-b border-brand-border transition ${editing ? 'bg-brand-bg/40' : 'hover:bg-brand-bg/40'}`}
                >
                  {editing ? (
                    <>
                      <RecordInputCells form={recordForm} setForm={setRecordForm} />
                      <td className="px-2 py-1.5">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSaveRecord(r.id)} disabled={savingRecord}
                            className="text-xs font-bold bg-brand-gold text-brand-bg px-2 py-1 rounded hover:bg-brand-gold-light transition disabled:opacity-50">
                            {savingRecord ? '...' : 'Save'}
                          </button>
                          <button type="button" onClick={handleCancelRecord}
                            className="text-xs font-bold text-brand-muted hover:text-brand-text px-2 py-1 rounded border border-brand-border transition">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1.5"><span className="text-brand-muted whitespace-nowrap">{r.race_date}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-text">{r.course}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-text whitespace-nowrap">{r.race_name}</span></td>
                      <td className="px-2 py-1.5"><GradeBadge grade={r.grade} /></td>
                      <td className="px-2 py-1.5 text-center"><FinishPos pos={r.finish_position} /></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.track}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.condition}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.distance}M</span></td>
                      {isEditingRaces && (
                        <td className="px-2 py-1.5">
                          {deleteRecordConfirmId === r.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-brand-muted text-[10px] normal-case">Delete?</span>
                              <button type="button" onClick={() => handleDeleteRecord(r.id)} disabled={savingRecord}
                                className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50">
                                {savingRecord ? '...' : 'Yes'}
                              </button>
                              <button type="button" onClick={() => setDeleteRecordConfirmId(null)}
                                className="text-xs font-bold text-brand-muted hover:text-brand-text">No</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleEditRecord(r)}
                                disabled={editingRecordId !== null}
                                className="text-brand-muted hover:text-brand-gold transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                                title={editingRecordId !== null ? 'Finish editing the current row first' : 'Edit record'}>
                                <Pencil size={13} />
                              </button>
                              <button type="button" onClick={() => setDeleteRecordConfirmId(r.id)}
                                disabled={editingRecordId !== null}
                                className="text-brand-muted hover:text-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                                title="Delete record">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </>
                  )}
                </tr>
              )
            })}

            {editingRecordId === 'new' && (
              <tr className="border-b border-brand-border bg-brand-bg/40">
                <RecordInputCells form={recordForm} setForm={setRecordForm} />
                <td className="px-2 py-1.5">
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCreateRecord} disabled={savingRecord}
                      className="text-xs font-bold bg-brand-gold text-brand-bg px-2 py-1 rounded hover:bg-brand-gold-light transition disabled:opacity-50">
                      {savingRecord ? '...' : 'Add'}
                    </button>
                    <button type="button" onClick={handleCancelRecord}
                      className="text-xs font-bold text-brand-muted hover:text-brand-text px-2 py-1 rounded border border-brand-border transition">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {sortedRecords.length === 0 && editingRecordId !== 'new' && (
              <tr>
                <td colSpan={isEditingRaces ? 9 : 8} className="px-3 py-4 text-center text-brand-muted normal-case">
                  No race records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {recordError && <p className="text-red-600 text-sm normal-case">{recordError}</p>}

      {isEditingRaces && (
        <button type="button" onClick={handleAddRecord} disabled={editingRecordId !== null}
          className="self-start flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-brand-gold-light px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-gold">
          <Plus size={13} /> Add Race
        </button>
      )}
    </div>
  )
}

export default HorseRaceRecordsEditor
