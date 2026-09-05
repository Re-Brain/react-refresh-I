import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, X, Home, ExternalLink, Eye } from 'lucide-react'
import { useAdminFarmApprovals } from '../hooks/useAdminFarmApprovals'
import { FARM_DOCUMENT_TYPES, missingFarmDocumentTypes } from '../../farm'

// Queue of farm registrations awaiting review. Approve is immediate; Reject
// requires a reason, shown to the farmer (same pattern as declining a visit).
function FarmApprovalsSection() {
  const { farms, loading, error, retry, busyId, actionError, act } = useAdminFarmApprovals()
  const [prompt, setPrompt] = useState<{ id: number } | null>(null)
  const [reason, setReason] = useState('')

  function openPrompt(id: number) {
    setPrompt({ id })
    setReason('')
  }

  function closePrompt() {
    setPrompt(null)
    setReason('')
  }

  async function confirmReject() {
    if (!promptFarm) return
    const ok = await act(promptFarm.id, 'rejected', reason.trim())
    if (ok) closePrompt()
  }

  const promptFarm = prompt ? farms.find(f => f.id === prompt.id) : undefined

  if (loading) return <p className="text-brand-muted text-sm">Loading…</p>

  if (error)
    return (
      <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
        <button
          onClick={retry}
          className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm shrink-0"
        >
          Retry
        </button>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      {actionError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {farms.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
          <Home size={28} className="text-brand-muted" />
          <p className="text-brand-muted text-sm">No farm registrations waiting for review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-brand-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
                <th className="text-center px-4 py-3 font-bold">Farm</th>
                <th className="text-center px-4 py-3 font-bold">Location</th>
                <th className="text-center px-4 py-3 font-bold">Documents</th>
                <th className="text-center px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {farms.map(f => {
                const missing = missingFarmDocumentTypes(f.documents)
                return (
                <tr key={f.id} className="border-b border-brand-border last:border-0 align-top">
                  <td className="px-4 py-3 text-left font-bold text-brand-text">{f.name}</td>
                  <td className="px-4 py-3 text-left text-brand-text">{f.location ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      {FARM_DOCUMENT_TYPES.map(t => {
                        const doc = f.documents.find(d => d.document_type === t.key)
                        return doc ? (
                          <a
                            key={t.key}
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-500 transition"
                          >
                            <ExternalLink size={12} /> {t.label}
                          </a>
                        ) : (
                          <span key={t.key} className="text-xs text-brand-muted">
                            — {t.label}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/admin/farms/${f.id}`}
                        className="flex items-center gap-1 text-brand-muted border border-brand-border font-bold px-3 py-1.5 rounded-lg hover:text-brand-gold hover:border-brand-gold transition text-xs"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <button
                        onClick={() => act(f.id, 'active')}
                        disabled={busyId === f.id || missing.length > 0}
                        title={missing.length > 0 ? `Missing: ${missing.map(m => FARM_DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}` : undefined}
                        className="flex items-center gap-1 bg-green-500/10 text-green-600 border border-green-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => openPrompt(f.id)}
                        disabled={busyId === f.id}
                        className="flex items-center gap-1 bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {prompt && promptFarm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closePrompt}>
          <div
            className="bg-brand-surface border border-brand-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-brand-text">Reject {promptFarm.name}&rsquo;s registration?</h3>
              <p className="text-brand-muted text-sm mt-1">
                The farmer will be notified with your reason, so let them know what needs fixing.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-muted uppercase">Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Let them know why…"
                rows={3}
                autoFocus
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={confirmReject}
                disabled={busyId === promptFarm.id || !reason.trim()}
                className="flex-1 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyId === promptFarm.id ? 'Rejecting…' : 'Confirm reject'}
              </button>
              <button
                onClick={closePrompt}
                disabled={busyId === promptFarm.id}
                className="flex-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2.5 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmApprovalsSection
