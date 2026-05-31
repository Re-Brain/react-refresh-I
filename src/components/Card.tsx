type CardProps = {
  name: string
  title: string
  img : string
}

function Card({ name, title, img }: CardProps) {
  return (
    <div className="border-2 border-gray p-4 rounded-lg bg-green-900">
      <img src={img} alt={name} className="w-full h-auto mb-4" />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-stroke">{name}</h2>
        <h2 className="text-xl font-semibold text-stroke">{title}</h2>



      </div>
    </div>
  )
}

export default Card
