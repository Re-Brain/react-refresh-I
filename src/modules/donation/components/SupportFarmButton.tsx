type SupportFarmButtonProps = {
  /** Called when the visitor clicks the button — navigates to the farm page. */
  onSupport: () => void
  /**
   * Colour treatment for the surface it sits on:
   *  - 'onLight' — gold button on the page's light background (default)
   *  - 'onGold'  — white button on the gold hero panel
   */
  variant?: 'onLight' | 'onGold'
}

const BUTTON_STYLES: Record<NonNullable<SupportFarmButtonProps['variant']>, string> = {
  onLight: 'bg-brand-gold text-white hover:bg-brand-gold-light',
  onGold: 'bg-white text-brand-gold hover:bg-brand-bg',
}

// Links off to the horse's farm page to donate — same pill treatment as
// BookVisitButton so the two read as a matched pair wherever they appear.
function SupportFarmButton({ onSupport, variant = 'onLight' }: SupportFarmButtonProps) {
  return (
    <button
      type="button"
      onClick={onSupport}
      className={`text-sm font-bold uppercase tracking-[0.2em] px-8 xs:px-10 sm:px-12 py-3.5 rounded-full shadow-md hover:scale-[1.03] transition ${BUTTON_STYLES[variant]}`}
    >
      Support This Horse
    </button>
  )
}

export default SupportFarmButton
