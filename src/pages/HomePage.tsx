import { useState } from 'react'
import Card from '../components/Card.tsx'
import horses from '../data/horse.tsx'

function HomePage() {

  const [sortByLikes, setSortByLikes] = useState(false)
  const [likes, setLikes] = useState<Record<number, number>>({})

  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({})
  const [showBookmarked, setShowBookmarked] = useState(false)

  const [query, setQuery] = useState("")

  const handleBookmark = (id: number) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const [filterByAge, setFilterByAge] = useState<number | null>(null)

  const handleLike = (id: number, amount: number) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + amount }))
  }

  const sortedHorses = sortByLikes
    ? [...horses].sort((a, b) => (likes[b.id] ?? 0) - (likes[a.id] ?? 0))
    : horses

  const fileteredHorsesByAge = filterByAge !== null
    ? sortedHorses.filter(horse => horse.age === filterByAge)
    : sortedHorses

  const filteredHorseByBookmark = showBookmarked
    ? fileteredHorsesByAge.filter(horse => bookmarks[horse.id])
    : fileteredHorsesByAge

  const searchedHorses = query
  ? filteredHorseByBookmark.filter(horse =>
      horse.name.toLowerCase().includes(query.toLowerCase())
    )
  : filteredHorseByBookmark

  const totalLikes = Object.values(likes).reduce((sum, n) => sum + n, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <header className="text-center border-2 border-gray-100 p-6 rounded-lg bg-amber-500">
          <h1 className="font-heading text-3xl font-bold">List of Japan Race Horses</h1>
        </header>

        <div className="text-center my-4 text-lg font-bold">
          <h2 className="text-3xl">Total Likes: {totalLikes}</h2>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            onClick={() => setSortByLikes(!sortByLikes)}
            className="border px-4 py-2 rounded-lg text-sm font-bold hover:bg-white hover:text-black transition"
          >
            {sortByLikes ? "Default Order" : "Sort by Likes"}
          </button>
          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className="border px-4 py-2 rounded-lg text-sm font-bold hover:bg-white hover:text-black transition"
          >
            {showBookmarked ? "Show All" : "Show Bookmarked Only"}
          </button>
          <select
            value={filterByAge ?? ""}
            onChange={e => setFilterByAge(e.target.value === "" ? null : Number(e.target.value))}
            className="border px-4 py-2 rounded-lg text-sm font-bold bg-black text-white"
          >
            <option value="">All Ages</option>
            <option value="3">Age 3</option>
            <option value="4">Age 4</option>
            <option value="5">Age 5</option>
            <option value="6">Age 6</option>
          </select>

          <input
            type="text"
            placeholder="Search horse..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="border px-4 py-2 rounded-lg text-sm bg-black text-white"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          { searchedHorses.length === 0 ? (
            <p className="text-center col-span-full text-gray-400">No horses found.</p>
          ) : (

          searchedHorses.map((horse) => (
            <Card
              key={horse.id}
              name={horse.name}
              title={horse.title}
              img={horse.img}
              age={horse.age}
              record={horse.record}
              trainer={horse.trainer}
              like={likes[horse.id] ?? 0}
              onLike={(amount) => handleLike(horse.id, amount)}
              fav={bookmarks[horse.id] ?? false}
              onBookmark={() => handleBookmark(horse.id)}
            />
          )))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
