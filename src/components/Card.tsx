import { useState } from 'react'
import { FaBookmark, FaHeart, FaRegBookmark } from 'react-icons/fa'

type CardProps = {
  name: string
  title: string
  img : string
}

function Card({ name, title, img }: CardProps) {

  const [like, setLike] = useState(0)
  const [fav, setFav] = useState(false)

  return (
    <div className="border-2 border-gray p-4 rounded-lg bg-green-900">
      <img src={img} alt={name} className="w-full h-auto mb-4" />

      <div className="text-center">
        <h2 className="text-3xl font-bold">{name}</h2>
        <h3 className="text-xl font-semibold">{title}</h3>

        <div className="flex justify-center gap-4 items-center">
          <button 
            onClick={() => setLike(like + 1)}
            className="flex items-center gap-2 text-white text-lg font-bold"
            >
            <FaHeart size={20}/> {like}
          </button>
          <button 
            onClick={() => setFav(!fav)}
            >
            {fav ? <FaBookmark className="text-white" size={20} /> : <FaRegBookmark className="text-gray-400" size={20} />}
          </button>
        </div>
        


      </div>
    </div>
  )
}

export default Card
