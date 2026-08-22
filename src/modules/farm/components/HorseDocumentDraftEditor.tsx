import { useRef } from 'react'
import { Upload, Trash2, FileText } from 'lucide-react'
import { DOCUMENT_TYPES } from '../api/horse'
import type { useHorseDocumentDraft } from '../hooks/useHorseDocumentDraft'

type HorseDocumentDraftEditorProps = {
  draft: ReturnType<typeof useHorseDocumentDraft>
}

// Document picker for the add-horse form: one optional slot per document
// type. The horse saves as a draft either way — all 3 are only required
// later, before it can be submitted for review (see the horse's edit page).
function HorseDocumentDraftEditor({ draft }: HorseDocumentDraftEditorProps) {
  const { files, handleSelect, handleRemove } = draft
  const inputRefs = useRef<Partial<Record<string, HTMLInputElement | null>>>({})

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
      <p className="text-xs font-bold text-brand-muted uppercase">Proof Documents</p>
      <p className="text-[12px] text-brand-muted normal-case">
        Admins need these to verify the horse&rsquo;s identity and legitimacy. Add them now or later —
        you&rsquo;ll need all 3 before you can submit this horse for review.
      </p>

      <div className="flex flex-col gap-3">
        {DOCUMENT_TYPES.map(({ key, label }) => {
          const file = files[key]
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 bg-brand-bg border border-brand-border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-brand-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-text">{label}</p>
                  {file && <p className="text-xs text-brand-muted truncate">{file.name}</p>}
                </div>
              </div>

              {file ? (
                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-red-600 px-3 py-1.5 rounded-lg border border-brand-border transition shrink-0"
                >
                  <Trash2 size={13} /> Remove
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => inputRefs.current[key]?.click()}
                    className="flex items-center gap-1 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition shrink-0"
                  >
                    <Upload size={13} /> Choose file
                  </button>
                  <input
                    ref={el => {
                      inputRefs.current[key] = el
                    }}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => {
                      const selected = e.target.files?.[0]
                      e.target.value = ''
                      if (selected) handleSelect(key, selected)
                    }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HorseDocumentDraftEditor
