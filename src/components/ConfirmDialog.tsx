type Props = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmingLabel?: string
  busy?: boolean
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmingLabel = 'Working…',
  busy = false,
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-brand-surface border border-brand-border rounded-xl p-4 xs:p-6 w-full max-w-md flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h3 className="text-lg font-bold text-brand-text">{title}</h3>
          {message && <p className="text-brand-muted text-sm mt-1">{message}</p>}
        </div>

        <div className="flex flex-col xs:flex-row items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`w-full xs:flex-1 text-white font-bold px-4 py-2.5 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-gold hover:bg-brand-gold/90'
            }`}
          >
            {busy ? confirmingLabel : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="w-full xs:flex-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2.5 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
