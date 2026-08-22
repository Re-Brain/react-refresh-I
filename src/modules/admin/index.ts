// Public API of the admin module. Nothing outside this group imports the
// sidebar, approvals sections, hooks, or api directly today — only the pages
// are needed for routing, so that's all this barrel exposes.
export { default as AdminDashboardPage } from './pages/AdminDashboardPage'
export { default as AdminFarmDetailPage } from './pages/AdminFarmDetailPage'
export { default as AdminHorseDetailPage } from './pages/AdminHorseDetailPage'
