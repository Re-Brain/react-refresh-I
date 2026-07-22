import { Upload, Trash2, MoveLeft, MoveRight } from 'lucide-react'
import type { useHorseImageDraft } from '../hooks/useHorseImageDraft'

type HorseImageDraftEditorProps = {
  draft: ReturnType<typeof useHorseImageDraft>
}

// Image picker for the add-horse form: adds local previews (max 3, at least one
// required), with remove and reorder controls. State lives in useHorseImageDraft.
function HorseImageDraftEditor({ draft }: HorseImageDraftEditorProps) {
  const { fileInputRef, images, imageError, handleSelectImage, handleRemoveImage, handleMoveImage } = draft

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-brand-muted uppercase">Images <span className="text-red-600">*</span> <span className="normal-case font-normal">({images.length}/3)</span></p>
        {images.length < 3 && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition"
            >
              <Upload size={13} /> Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
          </>
        )}
      </div>

      <p className="text-[12px] text-brand-muted normal-case">At least one image is required. You can add up to 3 and use the arrows to set their order.</p>

      {images.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-brand-border text-brand-muted text-sm">
          No images added yet
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={img.url} className="flex flex-col gap-2">
              <div className="group relative rounded-xl overflow-hidden h-40 bg-brand-bg">
                <img src={img.url} alt={`Preview ${i + 1}`} className="w-full h-full object-contain" />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveImage(i, -1)}
                    disabled={i === 0}
                    className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-2 py-1 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                    title="Move image earlier"
                  >
                    <MoveLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-2 py-1 rounded-lg border border-brand-border transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-brand-muted"
                    title="Move image later"
                  >
                    <MoveRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {imageError && <p className="text-red-600 text-sm normal-case">{imageError}</p>}
    </div>
  )
}

export default HorseImageDraftEditor
