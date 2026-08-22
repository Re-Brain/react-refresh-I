type FarmStoryProps = {
  /** The farm's description; the section renders nothing when it's empty/null. */
  description: string | null
}

// The farm's "Our Story" section — a headline plus the description with a
// drop-cap first letter. Renders nothing when there's no description.
function FarmStory({ description }: FarmStoryProps) {
  if (!description) return null

  return (
    <section className="flex flex-col gap-6">
      <h2
        style={{ fontFamily: 'var(--font-story-title)' }}
        className="text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
      >
        Our Story
      </h2>
      <p
        style={{ fontFamily: 'var(--font-story-body)' }}
        className="text-brand-text text-lg lg:text-xl leading-relaxed whitespace-pre-wrap text-left first-letter:float-left first-letter:text-5xl lg:first-letter:text-6xl first-letter:font-semibold first-letter:text-brand-gold first-letter:mr-2 first-letter:leading-none"
      >
        {description}
      </p>
    </section>
  )
}

export default FarmStory
