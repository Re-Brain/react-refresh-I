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
}

function Card({ name, title, img, age, record, trainer }: CardProps) {

  const [like, setLike] = useState(0)
  const [fav, setFav] = useState(false)
  const [expand, setExpand] = useState(false)

  return (
    <div className="border-2 border-gray p-4 rounded-lg bg-green-900">
      <img src={img} alt={name} className="w-full h-48 object-cover mb-4 rounded" />

      <div className="text-center">
        <h2 className="text-3xl font-bold">{name}</h2>
        <h3 className="text-xl font-semibold">{title}</h3>

        <button
          onClick={() => setExpand(!expand)}
          className="my-2 text-sm text-gray-400 hover:text-gray-200 border rounded-2xl px-3 py-1"
        >
          {expand ? "Hide Details" : "Show Details"}
        </button>

        { expand && (
          <div className="text-center m-4">
            <p><span className="font-bold">Age:</span> {age}</p>
            <p><span className="font-bold">Record:</span> {record}</p>
            <p><span className="font-bold">Trainer:</span> {trainer}</p>
          </div>
         )

        }

        <div className="flex justify-center gap-4 m-1 items-center">
          <button 
            onClick={() => setLike(like + 1)}
            disabled={like >= 10}
            className=
              {`${like >= 10 ? "text-gray-400" : "text-white"} 
              flex items-center gap-2 text-lg font-bold`}
            >
            <FaHeart size={20}/>
          </button>
          <button 
            onClick={() => setLike(like - 1)}
            disabled={like <= 0}
            className=
              {`${like <= 0 ? "text-gray-400" : "text-white"} 
              flex items-center gap-2 text-lg font-bold`}
            >
            <FaHeartCrack size={20}/>
          </button>
          <span className="text-lg font-bold">{like}</span>
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
