import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  updateRaceRecord,
  createRaceRecord,
  deleteRaceRecord,
  type Horse,
  type RaceRecord,
  type RaceRecordCreate,
  type RaceRecordUpdate,
} from '../api/horse'
import { recordFormIsValid } from '../components/raceRecordFields'

// Owns the race-records edit state and all CRUD logic for one horse.
// `editingRecordId` is a record id while editing an existing row, 'new' while
// adding a draft row, or null when idle. `isEditingRaces` is exposed so the
// page can lock the other sections while this one is being edited.
export function useHorseRaceRecords(horse: Horse | null, setHorse: Dispatch<SetStateAction<Horse | null>>) {
  const [isEditingRaces, setIsEditingRaces] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<number | 'new' | null>(null)
  const [recordForm, setRecordForm] = useState<RaceRecordUpdate>({})
  const [savingRecord, setSavingRecord] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)
  const [deleteRecordConfirmId, setDeleteRecordConfirmId] = useState<number | null>(null)

  function handleEditRecord(r: RaceRecord) {
    setEditingRecordId(r.id)
    setRecordForm({
      race_date: r.race_date,
      course: r.course,
      race_name: r.race_name,
      grade: r.grade ?? '',
      finish_position: r.finish_position,
      track: r.track,
      distance: r.distance,
      condition: r.condition,
    })
    setRecordError(null)
  }

  async function handleSaveRecord(recordId: number) {
    if (!horse) return

    if (!recordFormIsValid(recordForm)) {
      setRecordError('Please fill in all fields (grade and FP are optional).')
      return
    }

    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await updateRaceRecord(horse.id, recordId, recordForm)
      setHorse(h => h ? { ...h, race_records: h.race_records.map(r => r.id === recordId ? updated : r) } : h)
      setEditingRecordId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingRecord(false)
    }
  }

  function handleCancelRecord() {
    setEditingRecordId(null)
    setRecordError(null)
  }

  function handleAddRecord() {
    setEditingRecordId('new')
    setRecordForm({ race_date: '', course: '', race_name: '', grade: '', finish_position: undefined, track: '', distance: undefined, condition: '' })
    setRecordError(null)
  }

  async function handleCreateRecord() {
    if (!horse) return

    if (!recordFormIsValid(recordForm)) {
      setRecordError('Please fill in all fields (grade and FP are optional).')
      return
    }

    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await createRaceRecord(horse.id, { ...recordForm, grade: recordForm.grade || null, finish_position: recordForm.finish_position ?? null } as RaceRecordCreate)
      setHorse(updated)
      setEditingRecordId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to add race record')
    } finally {
      setSavingRecord(false)
    }
  }

  async function handleDeleteRecord(recordId: number) {
    if (!horse) return

    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await deleteRaceRecord(horse.id, recordId)
      setHorse(updated)
      setDeleteRecordConfirmId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to delete race record')
    } finally {
      setSavingRecord(false)
    }
  }

  return {
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
  }
}
