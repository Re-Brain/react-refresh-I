import type { RaceRecord } from '../api/horse'

// Mapping of race grades to their corresponding background colors for display.
const GRADE_COLORS: Record<string, string> = {
  G1: 'bg-red-500',
  G2: 'bg-blue-500',
  G3: 'bg-green-600',
}

// Small badge showing a race grade (G1/G2/G3), colour-coded; nothing if ungraded.
function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null
  const color = GRADE_COLORS[grade] ?? 'bg-brand-muted'
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1`}>
      {grade}
    </span>
  )
}

// Finishing position, with podium places (1/2/3) highlighted; an em dash if unknown.
function FinishPos({ pos }: { pos: number | null }) {
  if (pos == null) return <span className="text-brand-muted">—</span>
  const color =
    pos === 1
      ? 'text-amber-600 font-bold'
      : pos === 2
        ? 'text-slate-500 font-bold'
        : pos === 3
          ? 'text-orange-800 font-bold'
          : 'text-brand-muted'
  return <span className={color}>{pos}</span>
}

type HorseRaceRecordsProps = {
  records: RaceRecord[]
}

function HorseRaceRecords({ records }: HorseRaceRecordsProps) {
  if (records.length === 0) return null

  return (
    <section className="flex flex-col gap-6 py-4">
      <h2
        style={{ fontFamily: 'var(--font-story-title)' }}
        className="text-2xl xs:text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
      >
        Race Record
      </h2>
      <div className="bg-brand-surface border-4 border-brand-border rounded-xl shadow-xl p-4 xs:p-6">
        {/* Scrolling lives on its own inner element, separate from the
            rounded/bordered card above — scrolling the table used to clip
            text and badges right against the outer border's curve, which
            read as broken rather than "scroll for more". The fade mask
            gives an explicit hint that there's more to scroll to instead of
            an abrupt cut; not needed once the table fits without scrolling
            (lg and up). */}
        <div className="overflow-x-auto mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)] lg:mask-none">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
                <th className="text-left px-3 py-2 font-bold">Date</th>
                <th className="text-left px-3 py-2 font-bold">Course</th>
                <th className="text-left px-3 py-2 font-bold">Race</th>
                <th className="text-left px-3 py-2 font-bold">FP</th>
                <th className="text-left px-3 py-2 font-bold">Track</th>
                <th className="text-left px-3 py-2 font-bold">Dist.</th>
                <th className="text-left px-3 py-2 font-bold">Cond.</th>
              </tr>
            </thead>
            <tbody>
              {[...records]
                .sort((a, b) => b.race_date.localeCompare(a.race_date) || b.id - a.id)
                .map((r: RaceRecord) => (
                  <tr
                    key={r.id}
                    className="border-b border-brand-border hover:bg-brand-bg/40 transition"
                  >
                    <td className="px-3 py-2 text-brand-muted whitespace-nowrap">
                      {r.race_date}
                    </td>
                    <td className="px-3 py-2 text-brand-text">
                      {r.course}
                    </td>
                    <td className="px-3 py-2 text-brand-text whitespace-nowrap">
                      {r.race_name}
                      <GradeBadge grade={r.grade} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <FinishPos pos={r.finish_position} />
                    </td>
                    <td className="px-3 py-2 text-brand-muted">
                      {r.track}
                    </td>
                    <td className="px-3 py-2 text-brand-muted">
                      {r.distance}M
                    </td>
                    <td className="px-3 py-2 text-brand-muted">
                      {r.condition}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default HorseRaceRecords
