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
      <div className="max-w-6xl mx-auto px-8 flex flex-col gap-6">
        <h2
          style={{ fontFamily: 'var(--font-story-title)' }}
          className="text-3xl lg:text-4xl font-semibold tracking-wide text-white text-right"
        >
          Pedigree
        </h2>
        <div className="overflow-x-auto rounded-xl border-4 border-brand-border shadow-xl">
          <table
            style={{ fontFamily: 'var(--font-story-body)' }}
            className="w-full border-collapse text-lg lg:text-xl bg-brand-surface"
          >
            <tbody>
              <tr>
                <td
                  rowSpan={2}
                  className="border border-brand-border px-5 py-4 font-bold text-brand-text align-middle w-1/2"
                >
                  {horse.sire || '—'}
                </td>
                <td className="border border-brand-border px-5 py-4 text-brand-text">
                  {horse.sires_sire || '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-brand-border px-5 py-4 text-brand-text">
                  {horse.sires_dam || '—'}
                </td>
              </tr>
              <tr>
                <td
                  rowSpan={2}
                  className="border border-brand-border px-5 py-4 font-bold text-brand-text align-middle w-1/2"
                >
                  {horse.dam || '—'}
                </td>
                <td className="border border-brand-border px-5 py-4 text-brand-text">
                  {horse.dams_sire || '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-brand-border px-5 py-4 text-brand-text">
                  {horse.dams_dam || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default HorsePedigree
