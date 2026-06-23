import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Upload, Trash2, ChevronLeft, ChevronRight, MoveLeft, MoveRight, Loader2 } from 'lucide-react'
import { getHorse, updateHorse, uploadHorseImage, deleteHorseImage, reorderHorseImages, updateRaceRecord, type Horse, type HorseUpdate, type RaceRecord, type RaceRecordUpdate } from '../api/horse'

// JRA race classes, lowest to highest
const GRADES = ['Debut', 'Maiden', '1-Win', '2-Win', '3-Win', 'Open', 'Listed', 'G3', 'G2', 'G1'] as const

const TRACKS = ['Turf', 'Dirt'] as const

// Track conditions (going) differ by surface
const CONDITIONS: Record<string, string[]> = {
  Turf: ['Firm', 'Good', 'Yielding', 'Soft'],
  Dirt: ['Standard', 'Good', 'Muddy', 'Sloppy'],
}

const GRADE_COLORS: Record<string, string> = {
  Debut: 'bg-slate-500',
  Maiden: 'bg-zinc-500',
  '1-Win': 'bg-teal-600',
  '2-Win': 'bg-cyan-600',
  '3-Win': 'bg-indigo-500',
  Open: 'bg-purple-600',
  Listed: 'bg-amber-500',
  G3: 'bg-green-600',
  G2: 'bg-blue-500',
  G1: 'bg-red-500',
}

// Stop number inputs from changing value via scroll wheel or up/down arrow keys
function blurOnWheel(e: React.WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur()
}
function blockArrowKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null
  const color = GRADE_COLORS[grade] ?? 'bg-brand-muted'
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1`}>
      {grade}
    </span>
  )
}

function FinishPos({ pos }: { pos: number }) {
  const color = pos === 1 ? 'text-brand-gold font-bold' : pos === 2 ? 'text-slate-300 font-bold' : pos === 3 ? 'text-amber-600 font-bold' : 'text-brand-muted'
  return <span className={color}>{pos}</span>
}

const PEDIGREE_FIELDS: { key: keyof HorseUpdate; label: string }[] = [
  { key: 'sire', label: "Sire" },
  { key: 'dam', label: "Dam" },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

function HorseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<HorseUpdate>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteImageConfirmId, setDeleteImageConfirmId] = useState<number | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reordering, setReordering] = useState(false)

  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [recordForm, setRecordForm] = useState<RaceRecordUpdate>({})
  const [savingRecord, setSavingRecord] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !id) return
    getHorse(token, Number(id))
      .then(setHorse)
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (horse && activeImageIndex >= horse.images.length) {
      setActiveImageIndex(Math.max(0, horse.images.length - 1))
    }
  }, [horse?.images.length])

  // Auto-open edit mode when arriving via the table's edit shortcut (?edit=1)
  useEffect(() => {
    if (horse && searchParams.get('edit') === '1') {
      handleEditClick()
      searchParams.delete('edit')
      setSearchParams(searchParams, { replace: true })
    }
  }, [horse])

  function handleEditClick() {
    if (!horse) return
    setFormData({
      name: horse.name,
      date_of_birth: horse.date_of_birth ?? '',
      color: horse.color ?? '',
      gender: horse.gender ?? undefined,
      sire: horse.sire ?? '',
      dam: horse.dam ?? '',
      sires_sire: horse.sires_sire ?? '',
      sires_dam: horse.sires_dam ?? '',
      dams_sire: horse.dams_sire ?? '',
      dams_dam: horse.dams_dam ?? '',
    })
    setError(null)
    setIsEditing(true)
  }

  async function handleSave() {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    setSaving(true)
    setError(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([k, v]) => v !== horse[k as keyof Horse])
      ) as HorseUpdate
      let updated = await updateHorse(token, horse.id, payload)
      // If a race-record row is open in the editor, commit its edits with the same Save.
      if (editingRecordId !== null) {
        const savedRecord = await updateRaceRecord(token, horse.id, editingRecordId, recordForm)
        updated = { ...updated, race_records: updated.race_records.map(r => r.id === editingRecordId ? savedRecord : r) }
      }
      setHorse(updated)
      setIsEditing(false)
      setEditingRecordId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !horse) return
    const token = localStorage.getItem('access_token')
    if (!token) return
    setUploadingImage(true)
    setImageError(null)
    try {
      const updated = await uploadHorseImage(token, horse.id, file)
      setHorse(updated)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleImageDelete(imageId: number) {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    setImageError(null)
    setDeletingImage(true)
    try {
      const updated = await deleteHorseImage(token, horse.id, imageId)
      setHorse(updated)
      setDeleteImageConfirmId(null)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setDeletingImage(false)
    }
  }

  async function handleReorderImage(direction: -1 | 1) {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    const target = activeImageIndex + direction
    if (target < 0 || target >= horse.images.length) return
    const ids = horse.images.map(img => img.id)
    ;[ids[activeImageIndex], ids[target]] = [ids[target], ids[activeImageIndex]]
    setReordering(true)
    setImageError(null)
    try {
      const updated = await reorderHorseImages(token, horse.id, ids)
      setHorse(updated)
      setActiveImageIndex(target)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to reorder image')
    } finally {
      setReordering(false)
    }
  }

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
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await updateRaceRecord(token, horse.id, recordId, recordForm)
      setHorse(h => h ? { ...h, race_records: h.race_records.map(r => r.id === recordId ? updated : r) } : h)
      setEditingRecordId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingRecord(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!horse) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-400">{error ?? 'Horse not found'}</div>

  const imageCount = horse.images.length
  const activeImage = horse.images[activeImageIndex]

  // Stable, deterministic order so an edited record never jumps position
  // (the backend may return rows in a different order after an update).
  const sortedRecords = [...horse.race_records].sort(
    (a, b) => b.race_date.localeCompare(a.race_date) || b.id - a.id
  )

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Management
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand-gold">{horse.name}</h1>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
          >
            <Pencil size={14} /> Edit Horse Details
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">

        {/* Images */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-muted uppercase">Images <span className="normal-case font-normal">({imageCount}/3)</span></p>
            {imageCount < 3 && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-50"
                >
                  <Upload size={13} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </>
            )}
          </div>

          {imageCount === 0 ? (
            <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-brand-border text-brand-muted text-sm">
              No images uploaded
            </div>
          ) : (
            <div className="group relative rounded-xl overflow-hidden h-96">
              <img
                key={activeImage.id}
                src={activeImage.image_url}
                alt={horse.name}
                className="w-full h-full object-contain"
                decoding="async"
              />

              {/* Delete confirm overlay */}
              {deleteImageConfirmId === activeImage.id ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                  {deletingImage ? (
                    <>
                      <Loader2 size={24} className="text-white animate-spin" />
                      <p className="text-white text-xs font-bold">Deleting...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-xs font-bold">Delete this image?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImageDelete(activeImage.id)}
                          className="text-xs font-bold bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded transition"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteImageConfirmId(null)}
                          className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded transition"
                        >
                          No
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setDeleteImageConfirmId(activeImage.id)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition"
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Prev / Next arrows */}
              {imageCount > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(i => (i - 1 + imageCount) % imageCount)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(i => (i + 1) % imageCount)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {imageCount > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {horse.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`rounded-full transition-all duration-200 ${i === activeImageIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reorder controls */}
          {imageCount > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleReorderImage(-1)}
                disabled={reordering || activeImageIndex === 0}
                className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                title="Move image earlier"
              >
                <MoveLeft size={13} /> Move earlier
              </button>
              <span className="text-xs text-brand-muted">{activeImageIndex + 1} / {imageCount}</span>
              <button
                type="button"
                onClick={() => handleReorderImage(1)}
                disabled={reordering || activeImageIndex === imageCount - 1}
                className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                title="Move image later"
              >
                Move later <MoveRight size={13} />
              </button>
            </div>
          )}

          {imageError && <p className="text-red-400 text-sm">{imageError}</p>}
        </div>

        {/* Basic Info */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {([['name', 'Name'], ['color', 'Color']] as const).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-brand-muted">{label}</label>
                  <input
                    className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                    value={(formData[key] as string) ?? ''}
                    onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-brand-muted">Date of Birth</label>
                <input
                  type="date"
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={formData.date_of_birth ?? ''}
                  onChange={e => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-brand-muted">Gender</label>
                <select
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={formData.gender ?? ''}
                  onChange={e => setFormData(p => ({ ...p, gender: e.target.value as Horse['gender'] }))}
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {([['Name', horse.name], ['Color', horse.color], ['Date of Birth', horse.date_of_birth], ['Gender', horse.gender]] as const).map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-xs text-brand-muted">{label}</span>
                  <span className="text-brand-text font-bold capitalize">{value ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedigree */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Pedigree</p>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {PEDIGREE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-brand-muted">{label}</label>
                  <input
                    className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                    value={(formData[key] as string) ?? ''}
                    onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-brand-border bg-blue-500/10 text-center font-bold text-blue-300 px-3 w-16 align-middle">
                    Sire
                  </td>
                  <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                    {horse.sire || '—'}
                  </td>
                  <td className="border border-brand-border px-4 py-2 text-brand-muted">
                    {horse.sires_sire || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-brand-border px-4 py-2 text-brand-muted">
                    {horse.sires_dam || '—'}
                  </td>
                </tr>
                <tr>
                  <td rowSpan={2} className="border border-brand-border bg-rose-500/10 text-center font-bold text-rose-300 px-3 w-16 align-middle">
                    Dam
                  </td>
                  <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                    {horse.dam || '—'}
                  </td>
                  <td className="border border-brand-border px-4 py-2 text-brand-muted">
                    {horse.dams_sire || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-brand-border px-4 py-2 text-brand-muted">
                    {horse.dams_dam || '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {horse.race_records.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
            <p className="text-xs font-bold text-brand-muted uppercase">Race Record</p>
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
                    {isEditing && <th className="px-3 py-2" />}
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
                        <td className="px-2 py-1.5">
                          {editing
                            ? <input type="date" className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-32"
                                value={recordForm.race_date ?? ''} onChange={e => setRecordForm(p => ({ ...p, race_date: e.target.value }))} />
                            : <span className="text-brand-muted whitespace-nowrap">{r.race_date}</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <input className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24"
                                value={recordForm.course ?? ''} onChange={e => setRecordForm(p => ({ ...p, course: e.target.value }))} />
                            : <span className="text-brand-text">{r.course}</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <input className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-40"
                                value={recordForm.race_name ?? ''} onChange={e => setRecordForm(p => ({ ...p, race_name: e.target.value }))} />
                            : <span className="text-brand-text whitespace-nowrap">{r.race_name}</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24"
                                value={recordForm.grade ?? ''} onChange={e => setRecordForm(p => ({ ...p, grade: e.target.value }))}>
                                <option value="">—</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                            : <GradeBadge grade={r.grade} />}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {editing
                            ? <input type="number" min={1} onWheel={blurOnWheel} onKeyDown={blockArrowKeys} className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-14 text-center"
                                value={recordForm.finish_position ?? ''} onChange={e => setRecordForm(p => ({ ...p, finish_position: Number(e.target.value) }))} />
                            : <FinishPos pos={r.finish_position} />}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-20"
                                value={recordForm.track ?? ''} onChange={e => setRecordForm(p => ({ ...p, track: e.target.value, condition: '' }))}>
                                <option value="">—</option>
                                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            : <span className="text-brand-muted">{r.track}</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24 disabled:opacity-40"
                                value={recordForm.condition ?? ''} disabled={!recordForm.track}
                                onChange={e => setRecordForm(p => ({ ...p, condition: e.target.value }))}>
                                <option value="">—</option>
                                {(CONDITIONS[recordForm.track ?? ''] ?? []).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            : <span className="text-brand-muted">{r.condition}</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing
                            ? <input type="number" min={0} onWheel={blurOnWheel} onKeyDown={blockArrowKeys} className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-16"
                                value={recordForm.distance ?? ''} onChange={e => setRecordForm(p => ({ ...p, distance: Number(e.target.value) }))} />
                            : <span className="text-brand-muted">{r.distance}M</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing ? (
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleSaveRecord(r.id)} disabled={savingRecord}
                                className="text-xs font-bold bg-brand-gold text-brand-bg px-2 py-1 rounded hover:bg-brand-gold-light transition disabled:opacity-50">
                                {savingRecord ? '...' : 'Save'}
                              </button>
                              <button type="button" onClick={() => setEditingRecordId(null)}
                                className="text-xs font-bold text-brand-muted hover:text-brand-text px-2 py-1 rounded border border-brand-border transition">
                                Cancel
                              </button>
                            </div>
                          ) : isEditing ? (
                            <button type="button" onClick={() => handleEditRecord(r)}
                              disabled={editingRecordId !== null}
                              className="text-brand-muted hover:text-brand-gold transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                              title={editingRecordId !== null ? 'Finish editing the current row first' : 'Edit record'}>
                              <Pencil size={13} />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex flex-col gap-3">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditingRecordId(null) }}
                className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2 rounded-lg border border-brand-border transition text-sm"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HorseDetailPage
