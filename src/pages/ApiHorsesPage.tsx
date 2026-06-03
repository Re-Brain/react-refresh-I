import { useState, useEffect } from 'react'
import { getHorses, type Horse } from '../api/horses'
import Card from '../components/Card'

function ApiHorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [likes, setLikes] = useState<Record<number, number>>({})
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>({})

  useEffect(() => {
    getHorses()
      .then(setHorses)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleLike = (id: number, amount: number) =>
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + amount }))

  const handleBookmark = (id: number) =>
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }))

  const totalLikes = Object.values(likes).reduce((sum, n) => sum + n, 0)

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="max-w-6xl mx-auto p-4">

        <header className="text-center border border-brand-gold p-6 rounded-lg bg-brand-surface">
          <h1 className="text-3xl font-bold text-brand-gold">List of Japan Race Horses — API</h1>
        </header>

        <div className="text-center my-4">
          <h2 className="text-3xl font-bold text-brand-gold">Total Likes: {totalLikes}</h2>
        </div>

        {loading && <p className="text-center text-brand-muted mt-10">Loading horses...</p>}
        {error && <p className="text-center text-red-400 mt-10">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {horses.length === 0 ? (
              <p className="text-center col-span-full text-brand-muted">No horses found.</p>
            ) : (
              horses.map(horse => (
                <Card
                  key={horse.id}
                  name={horse.name}
                  title={horse.title}
                  img={horse.img}
                  age={horse.age}
                  record={horse.record}
                  trainer={horse.trainer}
                  like={likes[horse.id] ?? 0}
                  onLike={amount => handleLike(horse.id, amount)}
                  fav={bookmarks[horse.id] ?? false}
                  onBookmark={() => handleBookmark(horse.id)}
                />
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default ApiHorsesPage
