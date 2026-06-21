import { useState } from 'react'
import { Pencil, Trash2, X, ChevronUp, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { updateHorse, deleteHorse, type Horse, type HorseUpdate } from '../api/horse'

type Props = {
  horses: Horse[]
  onChange: (horses: Horse[]) => void
}

const PEDIGREE_FIELDS: { key: keyof HorseUpdate; label: string }[] = [
  { key: 'sire', label: "Sire" },
  { key: 'dam', label: "Dam" },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

function HorseTable({ horses, onChange }: Props) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [formData, setFormData] = useState<HorseUpdate>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleEditClick(horse: Horse) {
    if (expandedId === horse.id) {
      setExpandedId(null)
      return
    }
    setFormData({
      name: horse.name,
      breed: horse.breed ?? '',
      age: horse.age ?? undefined,
      gender: horse.gender ?? undefined,
      sire: horse.sire ?? '',
      dam: horse.dam ?? '',
      sires_sire: horse.sires_sire ?? '',
      sires_dam: horse.sires_dam ?? '',
      dams_sire: horse.dams_sire ?? '',
      dams_dam: horse.dams_dam ?? '',
    })
    setError(null)
    setDeleteConfirmId(null)
    setExpandedId(horse.id)
  }

  async function handleSave(horse: Horse) {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([k, v]) => v !== horse[k as keyof Horse])
      ) as HorseUpdate
      const updated = await updateHorse(token, horse.id, payload)
      onChange(horses.map(h => (h.id === updated.id ? updated : h)))
      setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setDeleting(true)
    try {
      await deleteHorse(token, id)
      onChange(horses.filter(h => h.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  if (horses.length === 0) {
    return <p className="text-brand-muted text-sm">No horses added yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
            <th className="text-left px-4 py-3 font-bold">ID</th>
            <th className="text-left px-4 py-3 font-bold">Name</th>
            <th className="text-left px-4 py-3 font-bold">Breed</th>
            <th className="text-left px-4 py-3 font-bold">Age</th>
            <th className="text-left px-4 py-3 font-bold">Gender</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {horses.map(horse => (
            <>
              <tr
                key={horse.id}
                className="border-b border-brand-border hover:bg-brand-surface/50 transition"
              >
                <td className="px-4 py-3 text-brand-muted">{horse.id}</td>
                <td className="px-4 py-3 font-bold text-brand-text">{horse.name}</td>
                <td className="px-4 py-3 text-brand-muted">{horse.breed ?? '—'}</td>
                <td className="px-4 py-3 text-brand-muted">{horse.age ?? '—'}</td>
                <td className="px-4 py-3 text-brand-muted capitalize">{horse.gender ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {deleteConfirmId === horse.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-brand-muted text-xs">Delete?</span>
                        <button
                          onClick={() => handleDelete(horse.id)}
                          disabled={deleting}
                          className="text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs font-bold text-brand-muted hover:text-brand-text"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/farmer/horses/${horse.id}`)}
                          className="text-brand-muted hover:text-brand-gold transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(horse)}
                          className="text-brand-muted hover:text-brand-gold transition"
                          title="Edit"
                        >
                          {expandedId === horse.id ? <ChevronUp size={16} /> : <Pencil size={16} />}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirmId(horse.id); setExpandedId(null) }}
                          className="text-brand-muted hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {expandedId === horse.id && (
                <tr key={`${horse.id}-edit`} className="bg-brand-surface/30 border-b border-brand-border">
                  <td colSpan={6} className="px-6 py-5">
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-xs font-bold text-brand-muted uppercase mb-3">Basic Info</p>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-brand-muted">Name</label>
                            <input
                              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                              value={formData.name ?? ''}
                              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-brand-muted">Breed</label>
                            <input
                              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                              value={formData.breed ?? ''}
                              onChange={e => setFormData(p => ({ ...p, breed: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-brand-muted">Age</label>
                            <input
                              type="number"
                              min={0}
                              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                              value={formData.age ?? ''}
                              onChange={e => setFormData(p => ({ ...p, age: Number(e.target.value) }))}
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
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="gelding">Gelding</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-brand-muted uppercase mb-3">Pedigree</p>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                      </div>

                      {error && <p className="text-red-400 text-sm">{error}</p>}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSave(horse)}
                          disabled={saving}
                          className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HorseTable
