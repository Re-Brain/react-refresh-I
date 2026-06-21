import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Upload, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getHorse, updateHorse, uploadHorseImage, deleteHorseImage, type Horse, type HorseUpdate } from '../api/horse'

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
  const [formData, setFormData] = useState<HorseUpdate>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteImageConfirmId, setDeleteImageConfirmId] = useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
    try {
      const updated = await deleteHorseImage(token, horse.id, imageId)
      setHorse(updated)
      setDeleteImageConfirmId(null)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to delete image')
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!horse) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-400">{error ?? 'Horse not found'}</div>

  const imageCount = horse.images.length
  const activeImage = horse.images[activeImageIndex]

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
            <Pencil size={14} /> Edit
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
            <div className="relative rounded-xl overflow-hidden h-96">
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
    </div>
  )
}

export default HorseDetailPage
