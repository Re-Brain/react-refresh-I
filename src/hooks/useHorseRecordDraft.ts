import { useState } from 'react'
import { recordFormIsValid, EMPTY_RECORD_FORM } from '../components/raceRecordFields'
import type { RaceRecordUpdate } from '../api/horse'

// Collects race records locally before the horse exists; they're created after.
// `recordForm` is the persistent draft row; Add appends it and clears the row.
export function useHorseRecordDraft() {
  const [records, setRecords] = useState<RaceRecordUpdate[]>([])
  const [recordForm, setRecordForm] = useState<RaceRecordUpdate>(EMPTY_RECORD_FORM)
  const [recordError, setRecordError] = useState<string | null>(null)

  function handleAddRecord() {
    if (!recordFormIsValid(recordForm)) {
      setRecordError('Please fill in all fields (grade and FP are optional).')
      return
    }
    setRecords(prev => [...prev, recordForm])
    setRecordForm(EMPTY_RECORD_FORM)
    setRecordError(null)
  }

  function removeRecord(index: number) {
    setRecords(prev => prev.filter((_, i) => i !== index))
  }

  return { records, recordForm, setRecordForm, recordError, handleAddRecord, removeRecord }
}
