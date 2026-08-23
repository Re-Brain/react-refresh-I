type HorseshoeIconProps = {
  className?: string
}

// The brand mark used in the nav logo and footer — an open U-shaped arc with
// nail holes, styled to match lucide's icon set (stroke-based, currentColor).
function HorseshoeIcon({ className }: HorseshoeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 21c-2-1.5-3-4-3-7a9 9 0 0 1 18 0c0 3-1 5.5-3 7" />
      <circle cx="7" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="16" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="16" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default HorseshoeIcon
