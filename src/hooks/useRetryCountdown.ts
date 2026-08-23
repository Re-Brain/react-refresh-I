import { useEffect, useRef, useState } from 'react'

// Ticks a countdown down to 0 once a second, for disabling a submit button
// and showing "try again in X" after a 429. Cleans up its own interval on
// unmount or when a fresh countdown is started before the last one finished.
export function useRetryCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function start(seconds: number) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setSecondsLeft(seconds)
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return { secondsLeft, start }
}

// 245 -> "4:05"
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
