import { useRef, useState, type ChangeEvent } from 'react'

export type DraftImage = { file: File; url: string }

// Collects images locally (with object-URL previews) before the horse exists,
// since upload needs a horse id. They're uploaded after creation, in order. Max 3.
export function useHorseImageDraft() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<DraftImage[]>([])
  const [imageError, setImageError] = useState<string | null>(null)

  function handleSelectImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return
    if (images.length >= 3) {
      setImageError('You can upload up to 3 images.')
      return
    }
    setImages(prev => [...prev, { file, url: URL.createObjectURL(file) }])
    setImageError(null)
  }

  function handleRemoveImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleMoveImage(index: number, direction: -1 | 1) {
    const target = index + direction
    setImages(prev => {
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return { fileInputRef, images, imageError, handleSelectImage, handleRemoveImage, handleMoveImage }
}
