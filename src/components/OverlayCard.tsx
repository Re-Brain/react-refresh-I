import { Link } from 'react-router-dom'

type OverlayCardProps = {
  to: string
  imageUrl: string
  title: string
}

function OverlayCard({ to, imageUrl, title }: OverlayCardProps) {
  return (
    <Link
      to={to}
      className="relative rounded-2xl overflow-hidden cursor-pointer bg-brand-bg ring-1 ring-brand-border hover:ring-2 hover:ring-brand-gold transition"
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full aspect-square object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white font-bold text-2xl uppercase tracking-wide">
        {title}
      </h3>
    </Link>
  )
}

export default OverlayCard
