// Public API of the combined farm+horse module. Only pieces with confirmed
// consumers outside this group are exported — everything else (the bulk of
// the 59 files here) stays fully internal.

// api/farm
export { getFarm, getActiveFarms, FARM_DOCUMENT_TYPES } from './api/farm'
export type { Farm, ActiveFarm, FarmDocument } from './api/farm'

// api/horse
export { getHorse, getHorsePublic, getAllHorses, DOCUMENT_TYPES } from './api/horse'
export type { Horse, HorseDocument } from './api/horse'

// api/availability
export { formatTime, getHorseVisitSlots } from './api/availability'
export type { Period } from './api/availability'

// lib
export { missingFarmDocumentTypes } from './lib/farmDocuments'
export { missingDocumentTypes } from './lib/horseDocuments'
export {
  FARM_STATUS_STYLES,
  FARM_STATUS_LABELS,
  HORSE_STATUS_STYLES,
  HORSE_STATUS_LABELS,
} from './lib/approvalStatusDisplay'

// hooks
export { PEDIGREE_FIELDS } from './hooks/useAddHorseForm'

// components
export { GradeBadge, FinishPos } from './components/raceRecordFields'
export { FarmProvider } from './components/FarmProvider'
export { default as RequireActiveFarm } from './components/RequireActiveFarm'

// pages
export { default as FarmDetailPage } from './pages/FarmDetailPage'
export { default as FarmsListPage } from './pages/FarmsListPage'
export { default as FarmerDashboardPage } from './pages/FarmerDashboardPage'
export { default as AddHorsePage } from './pages/AddHorsePage'
export { default as HorseEditPage } from './pages/HorseEditPage'
export { default as HorseProfilePage } from './pages/HorseProfilePage'
export { default as HorsesListPage } from './pages/HorsesListPage'
