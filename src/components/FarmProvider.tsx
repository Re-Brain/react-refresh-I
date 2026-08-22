import { useFarmData } from '../hooks/useFarmData'
import { useAuth } from '../context/useAuth'
import { FarmContext } from '../context/FarmContext'

// Fetches the farmer's farm + horses once per session (mounted above <Routes>,
// like AuthProvider) instead of per-page, so every farmer route — the
// dashboard, add/edit horse, Stripe return/refresh — reads the same
// farm.status without redundant requests. Only fetches for farmer accounts;
// visitors/admins never hit /farms/me.
export function FarmProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const enabled = user?.role === 'farmer'
  const { farm, setFarm, horses, setHorses, loading, loadError, horsesError, retryFarm, retryHorses, profileComplete } =
    useFarmData(enabled)

  const farmActive = farm?.status === 'active'

  return (
    <FarmContext.Provider
      value={{
        farm,
        setFarm,
        horses,
        setHorses,
        loading,
        loadError,
        horsesError,
        retryFarm,
        retryHorses,
        profileComplete,
        farmActive,
      }}
    >
      {children}
    </FarmContext.Provider>
  )
}
