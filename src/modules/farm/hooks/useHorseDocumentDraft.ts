import { useState } from 'react'
import type { DocumentType } from '../api/horse'

// Collects up to one file per required document type locally, before the horse
// exists (upload needs a horse id). Uploaded after creation, like image drafts.
// Unlike images, documents are optional at creation — only approval enforces
// that all 3 types are present.
export function useHorseDocumentDraft() {
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({})

  function handleSelect(type: DocumentType, file: File) {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  function handleRemove(type: DocumentType) {
    setFiles(prev => {
      const next = { ...prev }
      delete next[type]
      return next
    })
  }

  return { files, handleSelect, handleRemove }
}
