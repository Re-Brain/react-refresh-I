import type { RaceRecordUpdate } from '../api/horse'

// JRA race classes, lowest to highest
export const GRADES = ['Debut', 'Maiden', '1-Win', '2-Win', '3-Win', 'Open', 'Listed', 'G3', 'G2', 'G1'] as const

export const TRACKS = ['Turf', 'Dirt'] as const

// Track conditions (going) differ by surface
export const CONDITIONS: Record<string, string[]> = {
  Turf: ['Firm', 'Good', 'Yielding', 'Soft'],
  Dirt: ['Standard', 'Good', 'Muddy', 'Sloppy'],
}

const GRADE_COLORS: Record<string, string> = {
  Debut: 'bg-slate-500',
  Maiden: 'bg-zinc-500',
  '1-Win': 'bg-teal-600',
  '2-Win': 'bg-cyan-600',
  '3-Win': 'bg-indigo-500',
  Open: 'bg-purple-600',
  Listed: 'bg-amber-500',
  G3: 'bg-green-600',
  G2: 'bg-blue-500',
  G1: 'bg-red-500',
}

// Short display labels; stored values stay unchanged (e.g. 'Open' is saved, shown as 'OP')
const GRADE_LABELS: Record<string, string> = {
  Debut: 'DEB',
  Maiden: 'MDN',
  Open: 'OP',
  Listed: 'L',
}
export const gradeLabel = (grade: string) => GRADE_LABELS[grade] ?? grade

// A blank draft row for adding a new race record
export const EMPTY_RECORD_FORM: RaceRecordUpdate = {
  race_date: '', course: '', race_name: '', grade: '', finish_position: undefined, track: '', distance: undefined, condition: '',
}

// All fields except grade and finish position (FP) are required
export function recordFormIsValid(f: RaceRecordUpdate): boolean {
  return Boolean(f.race_date && f.course && f.race_name && f.track && f.distance && f.condition)
}

// Stop number inputs from changing value via scroll wheel or up/down arrow keys
function blurOnWheel(e: React.WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur()
}
function blockArrowKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
}

export function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null
  const color = GRADE_COLORS[grade] ?? 'bg-brand-muted'
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1`}>
      {gradeLabel(grade)}
    </span>
  )
}

export function FinishPos({ pos }: { pos: number | null }) {
  if (pos == null) return <span className="text-brand-muted">—</span>
  const color = pos === 1 ? 'text-amber-600 font-bold' : pos === 2 ? 'text-slate-500 font-bold' : pos === 3 ? 'text-orange-800 font-bold' : 'text-brand-muted'
  return <span className={color}>{pos}</span>
}

// Editable cells shared by the "edit existing record" row and the "add new record" draft row
export function RecordInputCells({ form, setForm }: { form: RaceRecordUpdate; setForm: React.Dispatch<React.SetStateAction<RaceRecordUpdate>> }) {
  return (
    <>
      <td className="px-2 py-1.5">
        <input type="date" className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-32"
          value={form.race_date ?? ''} onChange={e => setForm(p => ({ ...p, race_date: e.target.value }))} />
      </td>
      <td className="px-2 py-1.5">
        <input className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24"
          value={form.course ?? ''} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
      </td>
      <td className="px-2 py-1.5">
        <input className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-40"
          value={form.race_name ?? ''} onChange={e => setForm(p => ({ ...p, race_name: e.target.value }))} />
      </td>
      <td className="px-2 py-1.5">
        <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24"
          value={form.grade ?? ''} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
          <option value="">—</option>
          {GRADES.map(g => <option key={g} value={g}>{gradeLabel(g)}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5 text-center">
        <input type="number" min={1} onWheel={blurOnWheel} onKeyDown={blockArrowKeys} className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-14 text-center"
          value={form.finish_position ?? ''} onChange={e => setForm(p => ({ ...p, finish_position: e.target.value === '' ? null : Number(e.target.value) }))} />
      </td>
      <td className="px-2 py-1.5">
        <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-20"
          value={form.track ?? ''} onChange={e => setForm(p => ({ ...p, track: e.target.value, condition: '' }))}>
          <option value="">—</option>
          {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <select className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-24 disabled:opacity-40"
          value={form.condition ?? ''} disabled={!form.track}
          onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
          <option value="">—</option>
          {(CONDITIONS[form.track ?? ''] ?? []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <input type="number" min={0} onWheel={blurOnWheel} onKeyDown={blockArrowKeys} className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none focus:border-brand-gold w-16"
          value={form.distance ?? ''} onChange={e => setForm(p => ({ ...p, distance: e.target.value === '' ? undefined : Number(e.target.value) }))} />
      </td>
    </>
  )
}
