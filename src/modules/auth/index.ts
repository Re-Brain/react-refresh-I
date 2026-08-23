// Public API of the auth module. Code outside src/modules/auth should only
// import from here, never reach into ./context, ./components, ./pages, or
// ./api directly — that's what keeps this a module boundary rather than just
// a folder.
export { useAuth } from './context/useAuth'
export { AuthProvider } from './components/AuthProvider'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as RegisterFarmerPage } from './pages/RegisterFarmerPage'
export { default as RegisterVisitorPage } from './pages/RegisterVisitorPage'
export { default as CheckEmailPage } from './pages/CheckEmailPage'
export { default as VerifyEmailPage } from './pages/VerifyEmailPage'
export { default as ResetPasswordPage } from './pages/ResetPasswordPage'
export { requestPasswordReset, resetPassword, deleteAccount } from './api'
export type { UserMe } from './api'
