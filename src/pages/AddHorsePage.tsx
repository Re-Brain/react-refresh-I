import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, MoveLeft, MoveRight } from 'lucide-react'
import { createHorse, createRaceRecord, uploadHorseImage, type HorseCreate, type RaceRecordCreate, type RaceRecordUpdate } from '../api/horse'
import { GradeBadge, FinishPos, RecordInputCells, recordFormIsValid, EMPTY_RECORD_FORM } from '../components/raceRecordFields'
import { NAME_MAX, COLOR_MAX, validateName, validateColor, validateDob } from '../horseValidation'

const PEDIGREE_FIELDS: { key: keyof HorseForm; label: string }[] = [
  { key: 'sire', label: "Sire" },
  { key: 'dam', label: "Dam" },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

type HorseForm = Omit<HorseCreate, 'race_records'>

const empty: HorseForm = {
  name: '',
  date_of_birth: '',
  color: '',
  gender: null,
  sire: '',
  dam: '',
  sires_sire: '',
  sires_dam: '',
  dams_sire: '',
  dams_dam: '',
}

// Turn a draft row into the payload the create-record endpoint expects
function toRecordCreate(draft: RaceRecordUpdate): RaceRecordCreate {
  return { ...draft, grade: draft.grade || null, finish_position: draft.finish_position ?? null } as RaceRecordCreate
}

function AddHorsePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HorseForm>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Images are collected locally and uploaded after the horse exists (upload needs a horse id).
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<{ file: File; url: string }[]>([])
  const [imageError, setImageError] = useState<string | null>(null)

  function handleSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return
    if (images.length >= 3) {
      setImageError('You can upload up to 3 images.')
      return
    }
    setImages(prev => [...prev, { file, url: URL.createObjectURL(file) }])
    setImageError(null)
  }

  function handleRemoveImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleMoveImage(index: number, direction: -1 | 1) {
    const target = index + direction
    setImages(prev => {
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  // Race records are collected locally and created after the horse exists.
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

  function validate(): string | null {
    const nameError = validateName(form.name, 'Name')
    if (nameError) return nameError
    const colorError = validateColor(form.color ?? '')
    if (colorError) return colorError
    if (!form.gender) return 'Gender is required.'
    for (const { key, label } of PEDIGREE_FIELDS) {
      const error = validateName((form[key] as string) ?? '', label)
      if (error) return error
    }
    return validateDob(form.date_of_birth ?? '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    if (images.length === 0) {
      setError('At least one image is required.')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    // Include a fully-filled-but-not-yet-added draft row so it isn't silently lost.
    const allRecords = recordFormIsValid(recordForm) ? [...records, recordForm] : records
    // Retired racehorses always have race history, so at least one record is required.
    if (allRecords.length === 0) {
      setError('At least one race record is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const horse = await createHorse(token, {
        ...form,
        name: form.name.trim(),
        color: (form.color ?? '').trim(),
        sire: (form.sire ?? '').trim(),
        dam: (form.dam ?? '').trim(),
        sires_sire: (form.sires_sire ?? '').trim(),
        dams_sire: (form.dams_sire ?? '').trim(),
        sires_dam: (form.sires_dam ?? '').trim(),
        dams_dam: (form.dams_dam ?? '').trim(),
        race_records: [],
      })
      // Upload images in the order they were added so their positions match the preview.
      for (const img of images) {
        await uploadHorseImage(token, horse.id, img.file)
      }
      for (const record of allRecords) {
        await createRaceRecord(token, horse.id, toRecordCreate(record))
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add horse')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard/farmer')}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Management
      </button>

      <h1 className="text-2xl font-bold text-brand-gold mb-8">Add New Horse</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-muted uppercase">Images <span className="text-red-400">*</span> <span className="normal-case font-normal">({images.length}/3)</span></p>
            {images.length < 3 && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition"
                >
                  <Upload size={13} /> Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                />
              </>
            )}
          </div>

          <p className="text-[12px] text-brand-muted normal-case">At least one image is required. You can add up to 3 and use the arrows to set their order.</p>

          {images.length === 0 ? (
            <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-brand-border text-brand-muted text-sm">
              No images added yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div key={img.url} className="flex flex-col gap-2">
                  <div className="group relative rounded-xl overflow-hidden h-40 bg-brand-bg">
                    <img src={img.url} alt={`Preview ${i + 1}`} className="w-full h-full object-contain" />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {images.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(i, -1)}
                        disabled={i === 0}
                        className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-2 py-1 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                        title="Move image earlier"
                      >
                        <MoveLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-2 py-1 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                        title="Move image later"
                      >
                        <MoveRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {imageError && <p className="text-red-400 text-sm normal-case">{imageError}</p>}
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Name <span className="text-red-400">*</span></label>
              <input
                maxLength={NAME_MAX}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Color <span className="text-red-400">*</span></label>
              <input
                maxLength={COLOR_MAX}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.color ?? ''}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Date of Birth <span className="text-red-400">*</span></label>
              <input
                type="date"
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.date_of_birth ?? ''}
                onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Gender <span className="text-red-400">*</span></label>
              <select
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.gender ?? ''}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value as HorseCreate['gender'] || null }))}
              >
                <option value="">—</option>
                <option value="colt">Colt</option>
                <option value="stallion">Stallion</option>
                <option value="gelding">Gelding</option>
                <option value="filly">Filly</option>
                <option value="mare">Mare</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Pedigree</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PEDIGREE_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-brand-muted">{label} <span className="text-red-400">*</span></label>
                <input
                  maxLength={NAME_MAX}
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={(form[key] as string) ?? ''}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Race Records <span className="text-red-400">*</span></p>
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
                      <button type="button" onClick={() => setRecords(prev => prev.filter((_, j) => j !== i))}
                        className="text-brand-muted hover:text-red-400 transition" title="Remove record">
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
          {recordError && <p className="text-red-400 text-sm normal-case">{recordError}</p>}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Horse'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-brand-muted hover:text-brand-text font-bold px-6 py-2 rounded-lg border border-brand-border transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddHorsePage
