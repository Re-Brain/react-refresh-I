type HorseStoryProps = {
  /** The horse's story text; the section renders nothing when it's empty/null. */
  story: string | null
}

function HorseStory({ story }: HorseStoryProps) {
  if (!story) return null

  return (
    <section className="flex flex-col gap-6 py-4">
      <h2
        style={{ fontFamily: 'var(--font-story-title)' }}
        className="text-2xl xs:text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
      >
        Story
      </h2>
      <p
        style={{ fontFamily: 'var(--font-story-body)' }}
        className="text-brand-text text-lg xs:text-xl sm:text-2xl lg:text-3xl leading-relaxed whitespace-pre-wrap text-left first-letter:float-left first-letter:text-4xl xs:first-letter:text-5xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-semibold first-letter:text-brand-gold first-letter:mr-3 first-letter:leading-none"
      >
        {story}
      </p>
    </section>
  )
}

export default HorseStory
