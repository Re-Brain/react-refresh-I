import type { Horse } from '../api/horse'

type HorsePedigreeProps = {
  horse: Horse
}

function HorsePedigree({ horse }: HorsePedigreeProps) {
  const hasPedigree = [
    horse.sire,
    horse.dam,
    horse.sires_sire,
    horse.sires_dam,
    horse.dams_sire,
    horse.dams_dam,
  ].some(Boolean)

  if (!hasPedigree) return null

  return (
    <section className="relative left-1/2 right-1/2 mx-[-50vw] w-screen bg-brand-gold py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 xs:px-6 sm:px-8 flex flex-col gap-6">
        <h2
          style={{ fontFamily: 'var(--font-story-title)' }}
          className="text-2xl xs:text-3xl lg:text-4xl font-semibold tracking-wide text-white text-right"
        >
          Pedigree
        </h2>
        <div className="rounded-xl border-4 border-brand-border shadow-xl overflow-hidden">
          {/* Scrolling lives on its own inner element, separate from the
              rounded border above — see HorseRaceRecords for why. No fade
              mask here (unlike HorseRaceRecords): this table rarely
              overflows, and with no background of its own on the outer
              wrapper, a fade would reveal the gold section behind it
              instead of a clean edge. */}
          <div className="overflow-x-auto">
            <table
              style={{ fontFamily: 'var(--font-story-body)' }}
              className="w-full border-collapse text-sm xs:text-base sm:text-lg lg:text-xl bg-brand-surface"
            >
              <tbody>
                <tr>
                  <td
                    rowSpan={2}
                    className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 font-bold text-brand-text align-middle w-1/2"
                  >
                    {horse.sire || '—'}
                  </td>
                  <td className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 text-brand-text">
                    {horse.sires_sire || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 text-brand-text">
                    {horse.sires_dam || '—'}
                  </td>
                </tr>
                <tr>
                  <td
                    rowSpan={2}
                    className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 font-bold text-brand-text align-middle w-1/2"
                  >
                    {horse.dam || '—'}
                  </td>
                  <td className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 text-brand-text">
                    {horse.dams_sire || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-brand-border px-3 xs:px-5 py-3 xs:py-4 text-brand-text">
                    {horse.dams_dam || '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HorsePedigree
