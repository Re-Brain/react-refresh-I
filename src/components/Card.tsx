type CardProps = {
  name: string
  title: string
}

function Card({ name, title }: CardProps) {
  return (
    <div className="border-2 border-gray p-4 rounded-lg bg-green-900">
      <div className="">Profile Image</div>

      <div className="text-left">
        <h2 className="">{name}</h2>
        <h2 className="">{title}</h2>
      </div>
    </div>
  )
}

export default Card
