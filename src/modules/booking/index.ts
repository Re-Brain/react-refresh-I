// Public API of the booking module. Only the 5 pieces below have confirmed
// consumers outside this group — everything else (api.ts, the hooks, the
// display lib, the internal-only components) stays fully internal.
export { default as VisitorManagement } from './components/VisitorManagement'
export { default as BookVisitButton } from './components/BookVisitButton'
export { default as BookingsSection } from './components/BookingsSection'
export { default as BookVisitPage } from './pages/BookVisitPage'
export { default as BookingConfirmationPage } from './pages/BookingConfirmationPage'
