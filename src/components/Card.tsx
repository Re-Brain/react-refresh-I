import { useState } from 'react'

import { FaBookmark, FaHeart, FaRegBookmark } from 'react-icons/fa'
import { FaHeartCrack } from 'react-icons/fa6';

type CardProps = {
  name: string
  title: string
  img: string
  age: number
  record: string
  trainer: string
  like: number
  onLike: (amount: number) => void
  fav: boolean
  onBookmark: () => void
}

function Card({ name, title, img, age, record, trainer, like, onLike, fav, onBookmark }: CardProps) {

  const [expand, setExpand] = useState(false)

  return (
    <div className="border border-brand-border p-4 rounded-lg bg-brand-surface text-brand-text">
      <img src={img} alt={name} className="w-full h-48 object-cover mb-4 rounded" />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-text">{name}</h2>
        <h3 className="text-xl font-semibold text-brand-muted">{title}</h3>

        <button
          onClick={() => setExpand(!expand)}
          className="my-2 text-sm text-brand-muted hover:text-brand-gold border border-brand-border rounded-2xl px-3 py-1 transition"
        >
          {expand ? "Hide Details" : "Show Details"}
        </button>

        { expand && (
          <div className="text-center m-4 text-brand-text">
            <p><span className="font-bold text-brand-gold">Age:</span> {age}</p>
            <p><span className="font-bold text-brand-gold">Record:</span> {record}</p>
            <p><span className="font-bold text-brand-gold">Trainer:</span> {trainer}</p>
          </div>
         )

        }

        <div className="flex justify-center gap-4 m-1 items-center">
          <button
            onClick={() => onLike(1)}
            disabled={like >= 10}
            className=
              {`${like >= 10 ? "text-brand-muted" : "text-brand-gold"}
              flex items-center gap-2 text-lg font-bold`}
            >
            <FaHeart size={20}/>
          </button>
          <button
            onClick={() => onLike(-1)}
            disabled={like <= 0}
            className=
              {`${like <= 0 ? "text-brand-muted" : "text-brand-gold"}
              flex items-center gap-2 text-lg font-bold`}
            >
            <FaHeartCrack size={20}/>
          </button>
          <span className="text-lg font-bold text-brand-text">{like}</span>
          <button
            onClick={onBookmark}
            >
            {fav ? <FaBookmark className="text-brand-gold" size={20} /> : <FaRegBookmark className="text-brand-muted" size={20} />}
          </button>
        </div>
        


      </div>
    </div>
  )
}

export default Card
