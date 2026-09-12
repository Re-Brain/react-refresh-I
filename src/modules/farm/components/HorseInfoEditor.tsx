import { Pencil, X } from 'lucide-react'
import type { Horse } from '../api/horse'
import { NAME_MAX, COLOR_MAX } from '../horseValidation'
import { useHorseInfoForm, PEDIGREE_FIELDS } from '../hooks/useHorseInfoForm'

type HorseInfoEditorProps = {
  horse: Horse
  info: ReturnType<typeof useHorseInfoForm>
  /** True when another section is being edited or an image action is in flight. */
  locked: boolean
  /** True while an image action is in flight (drives the Edit button's tooltip). */
  imageBusy: boolean
}

// Basic info + story + pedigree card. Read-only view with an Edit button that
// swaps in the form; all state and save logic live in the useHorseInfoForm hook.
function HorseInfoEditor({ horse, info, locked, imageBusy }: HorseInfoEditorProps) {
  const { isEditing, setIsEditing, formData, setFormData, saving, error, handleEditClick, handleSave } = info

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEditClick}
            disabled={locked}
            className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-gold"
            title={imageBusy ? 'Wait for the image action to finish' : locked ? 'Finish editing race records first' : 'Edit horse details'}
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          {([['name', 'Name'], ['color', 'Color']] as const).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">{label}</label>
              <input
                maxLength={key === 'color' ? COLOR_MAX : NAME_MAX}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={(formData[key] as string) ?? ''}
                onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Date of Birth</label>
            <input
              type="date"
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={formData.date_of_birth ?? ''}
              onChange={e => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Gender</label>
            <select
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={formData.gender ?? ''}
              onChange={e => setFormData(p => ({ ...p, gender: e.target.value as Horse['gender'] }))}
            >
              <option value="">—</option>
              <option value="colt">Colt</option>
              <option value="stallion">Stallion</option>
              <option value="gelding">Gelding</option>
              <option value="filly">Filly</option>
              <option value="mare">Mare</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          {([['Name', horse.name], ['Color', horse.color], ['Date of Birth', horse.date_of_birth], ['Gender', horse.gender]] as const).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-xs text-brand-muted">{label}</span>
              <span className="text-brand-text font-bold capitalize">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">Story</p>
      {isEditing ? (
        <textarea
          rows={6}
          placeholder="Tell this horse's life story..."
          className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm leading-relaxed focus:outline-none focus:border-brand-gold resize-y"
          value={formData.story ?? ''}
          onChange={e => setFormData(p => ({ ...p, story: e.target.value }))}
        />
      ) : horse.story ? (
        <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap">{horse.story}</p>
      ) : (
        <p className="text-sm text-brand-muted italic">No story yet.</p>
      )}

      <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">Pedigree</p>
      {isEditing ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          {PEDIGREE_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">{label}</label>
              <input
                maxLength={NAME_MAX}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={(formData[key] as string) ?? ''}
                onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      ) : (
        // This table had no scroll wrapper at all before — at narrow widths
        // it would just overflow the card directly. The card's own padding
        // already buffers it from the rounded corner, so no extra chrome
        // split is needed here, just the scroll + min-w + fade.
        <div className="overflow-x-auto mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)] sm:mask-none">
        <table className="w-full min-w-100 text-sm border-collapse">
          <tbody>
            <tr>
              <td rowSpan={2} className="border border-brand-border bg-blue-500/10 text-center font-bold text-blue-700 px-3 w-16 align-middle">
                Sire
              </td>
              <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                {horse.sire || '—'}
              </td>
              <td className="border border-brand-border px-4 py-2 text-brand-muted">
                {horse.sires_sire || '—'}
              </td>
            </tr>
            <tr>
              <td className="border border-brand-border px-4 py-2 text-brand-muted">
                {horse.sires_dam || '—'}
              </td>
            </tr>
            <tr>
              <td rowSpan={2} className="border border-brand-border bg-rose-500/10 text-center font-bold text-rose-700 px-3 w-16 align-middle">
                Dam
              </td>
              <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                {horse.dam || '—'}
              </td>
              <td className="border border-brand-border px-4 py-2 text-brand-muted">
                {horse.dams_sire || '—'}
              </td>
            </tr>
            <tr>
              <td className="border border-brand-border px-4 py-2 text-brand-muted">
                {horse.dams_dam || '—'}
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      )}

      {isEditing && (
        <div className="flex flex-col gap-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2 rounded-lg border border-brand-border transition text-sm"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HorseInfoEditor
