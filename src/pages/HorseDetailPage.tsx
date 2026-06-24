import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Upload, Trash2, ChevronLeft, ChevronRight, MoveLeft, MoveRight, Loader2, Plus } from 'lucide-react'
import { getHorse, updateHorse, uploadHorseImage, deleteHorseImage, reorderHorseImages, updateRaceRecord, createRaceRecord, deleteRaceRecord, type Horse, type HorseUpdate, type RaceRecord, type RaceRecordCreate, type RaceRecordUpdate } from '../api/horse'
import { GradeBadge, FinishPos, RecordInputCells, recordFormIsValid } from '../components/raceRecordFields'
import { NAME_MAX, COLOR_MAX, validateName, validateColor, validateDob } from '../horseValidation'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingRaces, setIsEditingRaces] = useState(false)
  const [formData, setFormData] = useState<HorseUpdate>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteImageConfirmId, setDeleteImageConfirmId] = useState<number | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reordering, setReordering] = useState(false)

  // editingRecordId is a record id when editing an existing row, 'new' when adding a draft row
  const [editingRecordId, setEditingRecordId] = useState<number | 'new' | null>(null)
  const [recordForm, setRecordForm] = useState<RaceRecordUpdate>({})
  const [savingRecord, setSavingRecord] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)
  const [deleteRecordConfirmId, setDeleteRecordConfirmId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !id) return
    getHorse(token, Number(id))
      .then(setHorse)
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

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
    const validationError =
      validateName(formData.name ?? '', 'Name') ??
      validateColor(formData.color ?? '') ??
      (!formData.gender ? 'Gender is required.' : null) ??
      PEDIGREE_FIELDS.reduce<string | null>(
        (err, { key, label }) => err ?? validateName((formData[key] as string) ?? '', label),
        null,
      ) ??
      validateDob(formData.date_of_birth ?? '')
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const trimmed = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      )
      const payload = Object.fromEntries(
        Object.entries(trimmed).filter(([k, v]) => v !== horse[k as keyof Horse])
      ) as HorseUpdate
      const updated = await updateHorse(token, horse.id, payload)
      setHorse(updated)
      setIsEditing(false)
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
      // Keep the active index in range now that the array is shorter.
      setActiveImageIndex(i => Math.min(i, Math.max(0, updated.images.length - 1)))
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
    if (!recordFormIsValid(recordForm)) {
      setRecordError('Please fill in all fields (grade and FP are optional).')
      return
    }
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

  function handleAddRecord() {
    setEditingRecordId('new')
    setRecordForm({ race_date: '', course: '', race_name: '', grade: '', finish_position: undefined, track: '', distance: undefined, condition: '' })
    setRecordError(null)
  }

  async function handleCreateRecord() {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    if (!recordFormIsValid(recordForm)) {
      setRecordError('Please fill in all fields (grade and FP are optional).')
      return
    }
    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await createRaceRecord(token, horse.id, { ...recordForm, grade: recordForm.grade || null, finish_position: recordForm.finish_position ?? null } as RaceRecordCreate)
      setHorse(updated)
      setEditingRecordId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to add race record')
    } finally {
      setSavingRecord(false)
    }
  }

  async function handleDeleteRecord(recordId: number) {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    setSavingRecord(true)
    setRecordError(null)
    try {
      const updated = await deleteRaceRecord(token, horse.id, recordId)
      setHorse(updated)
      setDeleteRecordConfirmId(null)
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Failed to delete race record')
    } finally {
      setSavingRecord(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!horse) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-400">{error ?? 'Horse not found'}</div>

  const imageCount = horse.images.length
  // Clamp during render: after deleting the active (e.g. last) image, activeImageIndex can
  // momentarily point past the now-shorter array before the clamping effect runs. Reading
  // horse.images[outOfRange] would be undefined and crash the render, blanking the whole page.
  const safeImageIndex = Math.min(activeImageIndex, Math.max(0, imageCount - 1))
  const activeImage = horse.images[safeImageIndex]

  // Controls are locked while editing or while any image action (upload/delete/reorder)
  // is in flight, so only one thing happens at a time.
  const imageActionsLocked = isEditing || isEditingRaces || uploadingImage || deletingImage || reordering
  const imageBusy = uploadingImage || deletingImage || reordering

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-gold">{horse.name}</h1>
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
                  disabled={imageActionsLocked}
                  className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-gold"
                  title={imageBusy ? 'Wait for the image action to finish' : isEditing || isEditingRaces ? 'Finish editing first' : 'Upload image'}
                >
                  <Upload size={13} /> {uploadingImage ? 'Uploading...' : 'Upload'}
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
              ) : !imageActionsLocked ? (
                <button
                  onClick={() => setDeleteImageConfirmId(activeImage.id)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition"
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              ) : null}

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
                      className={`rounded-full transition-all duration-200 ${i === safeImageIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
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
                disabled={imageActionsLocked || safeImageIndex === 0}
                className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                title="Move image earlier"
              >
                <MoveLeft size={13} /> Move earlier
              </button>
              <span className="text-xs text-brand-muted">{safeImageIndex + 1} / {imageCount}</span>
              <button
                type="button"
                onClick={() => handleReorderImage(1)}
                disabled={imageActionsLocked || safeImageIndex === imageCount - 1}
                className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                title="Move image later"
              >
                Move later <MoveRight size={13} />
              </button>
            </div>
          )}

          {imageError && <p className="text-red-400 text-sm">{imageError}</p>}
        </div>

        {/* Basic Info + Pedigree */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEditClick}
                disabled={imageActionsLocked}
                className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-gold"
                title={imageBusy ? 'Wait for the image action to finish' : isEditingRaces ? 'Finish editing race records first' : 'Edit horse details'}
              >
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {([['name', 'Name'], ['color', 'Color']] as const).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-brand-muted">{label}</label>
                  <input
                    maxLength={key === 'color' ? COLOR_MAX : NAME_MAX}
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

          <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">Pedigree</p>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {PEDIGREE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-brand-muted">{label}</label>
                  <input
                    maxLength={NAME_MAX}
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
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2 rounded-lg border border-brand-border transition text-sm"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-muted uppercase">Race Record</p>
            {!isEditingRaces ? (
              <button
                type="button"
                onClick={() => setIsEditingRaces(true)}
                disabled={imageActionsLocked}
                className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-gold"
                title={imageBusy ? 'Wait for the image action to finish' : isEditing ? 'Finish editing horse details first' : 'Edit race records'}
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
                                <button type="button" onClick={() => setEditingRecordId(null)}
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
                                      className="text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-50">
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
                                      className="text-brand-muted hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
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
                          <button type="button" onClick={() => setEditingRecordId(null)}
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

            {recordError && <p className="text-red-400 text-sm normal-case">{recordError}</p>}

            {isEditingRaces && (
              <button type="button" onClick={handleAddRecord} disabled={editingRecordId !== null}
                className="self-start flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-brand-gold-light px-3 py-1.5 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-gold">
                <Plus size={13} /> Add Race
              </button>
            )}
          </div>
      </div>
    </div>
  )
}

export default HorseDetailPage
