import { useState, type Dispatch, type SetStateAction } from 'react'
import { uploadHorseDocument, deleteHorseDocument, type Horse, type DocumentType } from '../api/horse'

// Owns upload/delete for an existing horse's documents. Unlike images, each of
// the 3 slots is independent, so the busy state is per-type rather than a
// single boolean.
export function useHorseDocuments(horse: Horse | null, setHorse: Dispatch<SetStateAction<Horse | null>>) {
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  async function handleUpload(type: DocumentType, file: File) {
    if (!horse) return

    setUploadingType(type)
    setDocumentError(null)
    try {
      const updated = await uploadHorseDocument(horse.id, file, type)
      setHorse(updated)
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploadingType(null)
    }
  }

  async function handleDelete(documentId: number) {
    if (!horse) return

    setDocumentError(null)
    setDeletingId(documentId)
    try {
      const updated = await deleteHorseDocument(horse.id, documentId)
      setHorse(updated)
      setDeleteConfirmId(null)
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const busy = uploadingType !== null || deletingId !== null

  return {
    uploadingType,
    deletingId,
    documentError,
    deleteConfirmId,
    setDeleteConfirmId,
    handleUpload,
    handleDelete,
    busy,
  }
}
