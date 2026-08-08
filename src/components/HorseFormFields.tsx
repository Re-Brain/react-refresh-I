import type { Dispatch, SetStateAction } from 'react'
import type { HorseCreate } from '../api/horse'
import { NAME_MAX, COLOR_MAX } from '../horseValidation'
import { type HorseForm, PEDIGREE_FIELDS } from '../hooks/useAddHorseForm'

type HorseFormFieldsProps = {
  form: HorseForm
  setForm: Dispatch<SetStateAction<HorseForm>>
}

// The add-horse text fields: basic info (name/color/dob/gender), the optional
// story, and the required pedigree grid. Purely controlled inputs over `form`.
function HorseFormFields({ form, setForm }: HorseFormFieldsProps) {
  return (
    <>
      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
        <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
        <p className="text-[12px] text-brand-muted normal-case">
          Only Name is required for now — fill in the rest before submitting for review.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Name</label>
            <input
              maxLength={NAME_MAX}
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Color</label>
            <input
              maxLength={COLOR_MAX}
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={form.color ?? ''}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Date of Birth</label>
            <input
              type="date"
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={form.date_of_birth ?? ''}
              onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-muted">Gender</label>
            <select
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={form.gender ?? ''}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value as HorseCreate['gender'] || null }))}
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
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
        <p className="text-xs font-bold text-brand-muted uppercase">Story</p>
        <p className="text-[12px] text-brand-muted normal-case">Optional. Share this horse's life story — it appears on the public page.</p>
        <textarea
          rows={6}
          placeholder="Tell this horse's life story..."
          className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm leading-relaxed focus:outline-none focus:border-brand-gold resize-y"
          value={form.story ?? ''}
          onChange={e => setForm(p => ({ ...p, story: e.target.value }))}
        />
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
        <p className="text-xs font-bold text-brand-muted uppercase">Pedigree</p>
        <p className="text-[12px] text-brand-muted normal-case">Required before submitting for review, not to save a draft.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PEDIGREE_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-brand-muted">{label}</label>
              <input
                maxLength={NAME_MAX}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                value={(form[key] as string) ?? ''}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default HorseFormFields
