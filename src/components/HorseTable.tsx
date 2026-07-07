import { useState } from 'react'
import { Trash2, SquarePen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { deleteHorse, type Horse } from '../api/horse'

type Props = {
  horses: Horse[]
  onChange: (horses: Horse[]) => void
}

function HorseTable({ horses, onChange }: Props) {
  const navigate = useNavigate()
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: number) {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setDeleting(true)
    setError(null)
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
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-brand-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
              <th className="text-left px-4 py-3 font-bold">ID</th>
              <th className="text-left px-4 py-3 font-bold">Name</th>
              <th className="text-left px-4 py-3 font-bold">Color</th>
              <th className="text-left px-4 py-3 font-bold">Date of Birth</th>
              <th className="text-left px-4 py-3 font-bold">Gender</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {horses.map(horse => (
              <tr
                key={horse.id}
                className="border-b border-brand-border hover:bg-brand-surface/50 transition"
              >
                <td className="px-4 py-3 text-brand-muted">{horse.id}</td>
                <td className="px-4 py-3 font-bold text-brand-text">{horse.name}</td>
                <td className="px-4 py-3 text-brand-muted">{horse.color ?? '—'}</td>
                <td className="px-4 py-3 text-brand-muted">{horse.date_of_birth ?? '—'}</td>
                <td className="px-4 py-3 text-brand-muted capitalize">{horse.gender ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {deleteConfirmId === horse.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-brand-muted text-xs">Delete?</span>
                        <button
                          onClick={() => handleDelete(horse.id)}
                          disabled={deleting}
                          className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
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
                          title="View & edit"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(horse.id)}
                          className="text-brand-muted hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}

export default HorseTable
