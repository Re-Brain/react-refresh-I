import { useState, useEffect } from 'react'
import { getFarm, type ActiveFarm } from '../api/farm'
import { getAllHorses, type Horse } from '../api/horse'

export type FarmLoadState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; farm: ActiveFarm }

// Loads a public farm by id (as a load-state machine) plus the horses that live
// there. Horses load independently so a horses failure doesn't hide the farm.
export function useFarmDetail(id: string | undefined) {
  const [state, setState] = useState<FarmLoadState>({ status: 'loading' })
  const [horses, setHorses] = useState<Horse[]>([])
  const [horsesError, setHorsesError] = useState(false)

  useEffect(() => {
    getFarm(id!)
      .then(farm => setState(farm ? { status: 'ready', farm } : { status: 'notFound' }))
      .catch(() => setState({ status: 'error' }))

    // The backend has no "horses by farm" route, so fetch all and filter by farm_id.
    getAllHorses()
      .then(all => setHorses(all.filter(h => h.farm_id === Number(id))))
      .catch(() => setHorsesError(true))
  }, [id])

  return { state, horses, horsesError }
}
