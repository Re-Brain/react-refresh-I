import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import { uploadHorseImage, deleteHorseImage, reorderHorseImages, type Horse } from '../api/horse'

// Owns all image state and the upload / delete / reorder logic for one horse.
// `busy` is exposed so the page can lock the other sections while an image
// action is in flight.
export function useHorseImages(horse: Horse | null, setHorse: Dispatch<SetStateAction<Horse | null>>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteImageConfirmId, setDeleteImageConfirmId] = useState<number | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)
  const [reordering, setReordering] = useState(false)

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !horse) return

    setUploadingImage(true)
    setImageError(null)
    try {
      const updated = await uploadHorseImage(horse.id, file)
      setHorse(updated)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleImageDelete(imageId: number) {
    if (!horse) return

    setImageError(null)
    setDeletingImage(true)
    try {
      const updated = await deleteHorseImage(horse.id, imageId)
      setHorse(updated)
      setActiveImageIndex(i => Math.min(i, Math.max(0, updated.images.length - 1)))
      setDeleteImageConfirmId(null)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setDeletingImage(false)
    }
  }

  async function handleReorderImage(direction: -1 | 1) {
    if (!horse) return

    const target = activeImageIndex + direction
    if (target < 0 || target >= horse.images.length) return

    const ids = horse.images.map(img => img.id)
    ;[ids[activeImageIndex], ids[target]] = [ids[target], ids[activeImageIndex]]

    setReordering(true)
    setImageError(null)
    try {
      const updated = await reorderHorseImages(horse.id, ids)
      setHorse(updated)
      setActiveImageIndex(target)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to reorder image')
    } finally {
      setReordering(false)
    }
  }

  // True while any image action is in flight — used to lock the other sections.
  const busy = uploadingImage || deletingImage || reordering

  return {
    fileInputRef,
    activeImageIndex,
    setActiveImageIndex,
    uploadingImage,
    deletingImage,
    imageError,
    deleteImageConfirmId,
    setDeleteImageConfirmId,
    handleImageUpload,
    handleImageDelete,
    handleReorderImage,
    busy,
  }
}
