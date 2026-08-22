type BookVisitButtonProps = {
  /** Whether the horse can currently be booked. */
  bookable: boolean
  /** Called when the visitor clicks the button. */
  onBook: () => void
  /**
   * Colour treatment for the surface it sits on:
   *  - 'onLight' — gold button on the page's light background (default)
   *  - 'onGold'  — white button on the gold hero panel
   */
  variant?: 'onLight' | 'onGold'
}

const BUTTON_STYLES: Record<NonNullable<BookVisitButtonProps['variant']>, string> = {
  onLight: 'bg-brand-gold text-white hover:bg-brand-gold-light',
  onGold: 'bg-white text-brand-gold hover:bg-brand-bg',
}

const NOTICE_STYLES: Record<NonNullable<BookVisitButtonProps['variant']>, string> = {
  onLight: 'text-brand-muted',
  onGold: 'text-white/70',
}

// The "Book a Visit" call-to-action, or a "not available" notice when the horse
// isn't bookable. Shared by the hero panel and the lower booking strip; the
// `variant` picks the colours for whichever background it sits on.
function BookVisitButton({ bookable, onBook, variant = 'onLight' }: BookVisitButtonProps) {
  if (!bookable) {
    return (
      <p className={`text-sm font-bold uppercase tracking-[0.2em] ${NOTICE_STYLES[variant]}`}>
        Not currently available for visits
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={onBook}
      className={`text-sm font-bold uppercase tracking-[0.2em] px-12 py-3.5 rounded-full shadow-md hover:scale-[1.03] transition ${BUTTON_STYLES[variant]}`}
    >
      Book a Visit
    </button>
  )
}

export default BookVisitButton
