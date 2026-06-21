import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHorse, type HorseCreate } from '../api/horse'
import { ArrowLeft } from 'lucide-react'

const PEDIGREE_FIELDS: { key: keyof HorseCreate; label: string }[] = [
  { key: 'sire', label: "Sire" },
  { key: 'dam', label: "Dam" },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

const empty: HorseCreate = {
  name: '',
  breed: '',
  age: null,
  gender: null,
  sire: '',
  dam: '',
  sires_sire: '',
  sires_dam: '',
  dams_sire: '',
  dams_dam: '',
}

function AddHorsePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HorseCreate>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Horse name is required.')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      await createHorse(token, form)
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
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Name <span className="text-red-400">*</span></label>
              <input
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Breed</label>
              <input
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.breed ?? ''}
                onChange={e => setForm(p => ({ ...p, breed: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Age</label>
              <input
                type="number"
                min={0}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={form.age ?? ''}
                onChange={e => setForm(p => ({ ...p, age: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">Gender</label>
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
                <label className="text-xs text-brand-muted">{label}</label>
                <input
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={(form[key] as string) ?? ''}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
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
