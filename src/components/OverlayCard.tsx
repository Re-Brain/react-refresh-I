import { Link } from 'react-router-dom'

type OverlayCardProps = {
  to: string
  // Omit / null when there's no photo — a branded monogram tile is shown instead.
  imageUrl?: string | null
  title: string
}

function OverlayCard({ to, imageUrl, title }: OverlayCardProps) {
  return (
    <Link
      to={to}
      draggable={false}
      className="block relative rounded-xl overflow-hidden cursor-pointer bg-brand-bg ring-1 ring-brand-border hover:ring-2 hover:ring-brand-gold transition"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full aspect-square object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
        <div
          aria-hidden
          className="w-full aspect-square bg-linear-to-br from-brand-gold to-[#1f4d3a] flex items-center justify-center"
        >
          <span
            style={{ fontFamily: 'var(--font-story-title)' }}
            className="text-white/25 font-extrabold text-7xl uppercase leading-none select-none"
          >
            {title.charAt(0)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <h3 className="absolute bottom-0 left-0 right-0 p-3 text-white font-bold text-xl uppercase tracking-wide">
        {title}
      </h3>
    </Link>
  )
}

export default OverlayCard
