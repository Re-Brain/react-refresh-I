import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, X, ListChecks, ExternalLink, Eye } from 'lucide-react'
import { useAdminHorseApprovals } from '../hooks/useAdminHorseApprovals'
import { DOCUMENT_TYPES, missingDocumentTypes } from '../../farm'

// Queue of horses farmers want to add to their farm, awaiting review. Approve
// is immediate; Reject requires a reason, shown to the farmer.
function HorseApprovalsSection() {
  const { horses, loading, error, retry, busyId, actionError, act } = useAdminHorseApprovals()
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
    if (!promptHorse) return
    const ok = await act(promptHorse.id, 'rejected', reason.trim())
    if (ok) closePrompt()
  }

  const promptHorse = prompt ? horses.find(h => h.id === prompt.id) : undefined

  if (loading) return <p className="text-brand-muted text-sm">Loading…</p>

  if (error)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
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

      {horses.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
          <ListChecks size={28} className="text-brand-muted" />
          <p className="text-brand-muted text-sm">No horses waiting for review.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-brand-border overflow-hidden">
          {/* Scroll lives on its own inner element, separate from the
              rounded border above (see HorseRaceRecords for why), with a
              min-w so the table overflows and scrolls instead of squeezing
              its 6 columns down on a narrow screen. */}
          <div className="overflow-x-auto mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)] lg:mask-none">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
                <th className="text-center px-4 py-3 font-bold">Horse</th>
                <th className="text-center px-4 py-3 font-bold">Farm</th>
                <th className="text-center px-4 py-3 font-bold">Gender</th>
                <th className="text-center px-4 py-3 font-bold">Date of birth</th>
                <th className="text-center px-4 py-3 font-bold">Documents</th>
                <th className="text-center px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {horses.map(h => {
                const missing = missingDocumentTypes(h.documents)
                return (
                <tr key={h.id} className="border-b border-brand-border last:border-0 align-top">
                  <td className="px-4 py-3 text-left font-bold text-brand-text">{h.name}</td>
                  <td className="px-4 py-3 text-left text-brand-text">{h.farm_name ?? `Farm #${h.farm_id}`}</td>
                  <td className="px-4 py-3 text-left text-brand-text capitalize">{h.gender ?? '—'}</td>
                  <td className="px-4 py-3 text-left text-brand-text">{h.date_of_birth ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      {DOCUMENT_TYPES.map(t => {
                        const doc = h.documents.find(d => d.document_type === t.key)
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
                        to={`/admin/horses/${h.id}`}
                        className="flex items-center gap-1 text-brand-muted border border-brand-border font-bold px-3 py-1.5 rounded-lg hover:text-brand-gold hover:border-brand-gold transition text-xs"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <button
                        onClick={() => act(h.id, 'approved')}
                        disabled={busyId === h.id || missing.length > 0}
                        title={missing.length > 0 ? `Missing: ${missing.map(m => DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}` : undefined}
                        className="flex items-center gap-1 bg-green-500/10 text-green-600 border border-green-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => openPrompt(h.id)}
                        disabled={busyId === h.id}
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
        </div>
      )}

      {prompt && promptHorse && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closePrompt}>
          <div
            className="bg-brand-surface border border-brand-border rounded-xl p-4 xs:p-6 w-full max-w-md flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-brand-text">Reject {promptHorse.name}&rsquo;s registration?</h3>
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
                disabled={busyId === promptHorse.id || !reason.trim()}
                className="flex-1 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyId === promptHorse.id ? 'Rejecting…' : 'Confirm reject'}
              </button>
              <button
                onClick={closePrompt}
                disabled={busyId === promptHorse.id}
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

export default HorseApprovalsSection
