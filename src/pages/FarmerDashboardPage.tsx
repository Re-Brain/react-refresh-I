import { useState, useEffect } from 'react'
import { Menu, Home, List, Settings, Lock, AlertTriangle, X, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getMyFarm, updateMyFarm, isFarmComplete, type Farm, type FarmUpdate } from '../api/farm'
import { getMyHorses, type Horse } from '../api/horse'
import { changePassword, deleteAccount } from '../api/auth'
import HorseTable from '../components/HorseTable'

type Section = 'farm-info' | 'horse-management' | 'settings'

const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'farm-info', label: 'Farm Info', icon: <Home size={18} /> },
  { key: 'horse-management', label: 'Horse Management', icon: <List size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

function FarmerDashboardPage() {
  const { logout } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>(
    (sessionStorage.getItem('dashboardSection') as Section) ?? 'farm-info'
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FarmUpdate>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const navigate = useNavigate()

  // Change password form
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    getMyFarm(token).then(setFarm).catch(console.error)
    getMyHorses(token).then(setHorses).catch(console.error)
  }, [])

  const profileComplete = farm ? isFarmComplete(farm) : false

  function handleEditClick() {
    if (!farm) return
    setFormData({
      name: farm.name,
      location: farm.location ?? '',
      description: farm.description ?? '',
      capacity: farm.capacity ?? undefined,
    })
    setSaveError(null)
    setIsEditing(true)
  }

  async function handleSave() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([k, v]) => v !== farm![k as keyof Farm])
      ) as FarmUpdate
      const updated = await updateMyFarm(token, payload)
      setFarm(updated)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function handleNavClick(key: Section) {
    if (key === 'horse-management' && !profileComplete) return
    sessionStorage.setItem('dashboardSection', key)
    setActiveSection(key)
  }

  async function handleChangePassword() {
    setPwError(null)
    setPwSuccess(false)
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    setPwSaving(true)
    try {
      await changePassword(token, pwForm.current, pwForm.next)
      setPwForm({ current: '', next: '', confirm: '' })
      setPwSuccess(true)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount(token)
      logout()
      navigate('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} py-4 border-b border-brand-border`}>
          {sidebarOpen && <p className="text-brand-muted text-xs font-bold uppercase">Dashboard</p>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-brand-muted hover:text-brand-gold transition"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-2 mt-2">
          {navItems.map(item => {
            const locked = item.key === 'horse-management' && !profileComplete
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                disabled={locked}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-sm transition ${
                  locked
                    ? 'text-brand-muted opacity-40 cursor-not-allowed'
                    : activeSection === item.key
                    ? 'bg-brand-gold text-brand-bg'
                    : 'text-brand-muted hover:text-brand-gold hover:bg-brand-bg'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={locked ? 'Complete your farm profile to unlock' : (!sidebarOpen ? item.label : undefined)}
              >
                {locked ? <Lock size={18} /> : item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {!profileComplete && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              Your farm profile is incomplete. Fill in your farm details below to activate your account and unlock all features.
            </p>
          </div>
        )}

        {activeSection === 'farm-info' && (
          <div>
            <h2 className="text-2xl font-bold text-brand-gold mb-6">Farm Info</h2>
            <div className="flex flex-col gap-6">
              <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-6">
                {isEditing ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Farm Name</label>
                      <input
                        className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                        value={formData.name ?? ''}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Description</label>
                      <textarea
                        rows={3}
                        className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
                        value={formData.description ?? ''}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Capacity</label>
                      <input
                        type="number"
                        min={1}
                        className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                        value={formData.capacity ?? ''}
                        onChange={e => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                      <input
                        className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                        value={formData.location ?? ''}
                        onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                    {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Farm Name</label>
                      <p className="text-brand-text font-bold text-lg">{farm?.name ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Description</label>
                      <p className="text-brand-text">{farm?.description ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Capacity</label>
                      <p className="text-brand-text">{farm?.capacity ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                      <p className="text-brand-text">{farm?.location ?? '—'}</p>
                    </div>
                    <button
                      onClick={handleEditClick}
                      className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
                    >
                      Edit Farm Info
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'horse-management' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-gold">Horse Management</h2>
              <button
                onClick={() => navigate('/dashboard/farmer/horses/new')}
                className="flex items-center gap-2 bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
              >
                <Plus size={16} /> Add Horse
              </button>
            </div>
            <HorseTable horses={horses} onChange={setHorses} />
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-brand-gold mb-6">Settings</h2>

            <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4 mb-6">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Lock size={18} /> Change Password
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-muted uppercase">Current Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                    value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase">New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                    value={pwForm.next}
                    onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
              {pwSuccess && <p className="text-green-400 text-sm">Password changed successfully.</p>}
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
              >
                {pwSaving ? 'Saving...' : 'Update Password'}
              </button>
            </div>

            <div className="bg-brand-surface border border-red-500/40 rounded-lg p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} /> Delete Account
              </h3>
              <p className="text-brand-muted text-sm">
                Permanently delete your account, your farm, and all associated horses. This action
                cannot be undone.
              </p>
              {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => { setDeleteError(null); setShowDeleteConfirm(true) }}
                  className="self-start bg-red-500/10 text-red-400 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-brand-text text-sm font-bold">
                    Are you absolutely sure? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my account'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default FarmerDashboardPage
