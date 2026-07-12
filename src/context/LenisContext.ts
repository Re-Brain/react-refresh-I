import { createContext } from 'react'
import type { RefObject } from 'react'
import type Lenis from 'lenis'

// Exposes the app-level Lenis smooth-scroll instance (created in App) so pages
// can trigger animated programmatic scrolls via lenis.scrollTo(). Holds the ref
// object, so consumers read `.current` at call time (it's null under
// prefers-reduced-motion, where Lenis is never created).
export const LenisContext = createContext<RefObject<Lenis | null> | null>(null)
