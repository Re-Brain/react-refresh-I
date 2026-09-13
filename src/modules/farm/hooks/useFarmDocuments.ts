import { useState } from 'react'
import { uploadFarmDocument, deleteFarmDocument, type Farm, type FarmDocumentType } from '../api/farm'

// Owns upload/delete for the caller's own farm documents. Unlike images, each
// of the 3 slots is independent, so the busy state is per-type rather than a
// single boolean. Mirrors useHorseDocuments.
export function useFarmDocuments(farm: Farm | null, setFarm: (farm: Farm | null) => void) {
  const [uploadingType, setUploadingType] = useState<FarmDocumentType | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  async function handleUpload(type: FarmDocumentType, file: File) {
    if (!farm) return

    setUploadingType(type)
    setDocumentError(null)
    try {
      const updated = await uploadFarmDocument(file, type)
      setFarm(updated)
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploadingType(null)
    }
  }

  async function handleDelete(documentId: number) {
    if (!farm) return

    setDocumentError(null)
    setDeletingId(documentId)
    try {
      const updated = await deleteFarmDocument(documentId)
      setFarm(updated)
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
