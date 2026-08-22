import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useFarm } from '../context/useFarm'
import { useFarmInfoForm } from '../hooks/useFarmInfoForm'
import { useFarmDocuments } from '../hooks/useFarmDocuments'
import { useFarmSubmit } from '../hooks/useFarmSubmit'
import { useAccountSettings } from '../../../hooks/useAccountSettings'
import DashboardSidebar, { gatedSections, type Section } from '../components/DashboardSidebar'
import FarmInfoSection from '../components/FarmInfoSection'
import HorseManagementSection from '../components/HorseManagementSection'
import AvailabilitySection from '../components/AvailabilitySection'
import SettingsSection from '../../../components/SettingsSection'
import { VisitorManagement } from '../../booking'
import { DonationManagement } from '../../donation'

function FarmerDashboardPage() {
  const navigate = useNavigate()

  // Which tab is showing (persisted across reloads) and whether the nav is expanded.
  const [activeSection, setActiveSection] = useState<Section>(
    (sessionStorage.getItem('dashboardSection') as Section) ?? 'farm-info'
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Farm + horses data (fetched once, shared across all farmer routes — see
  // FarmProvider), the farm-info form, and the settings-tab logic.
  const { farm, setFarm, horses, setHorses, loading, loadError, horsesError, retryFarm, retryHorses, farmActive } = useFarm()
  const info = useFarmInfoForm(farm, setFarm)
  const documents = useFarmDocuments(farm, setFarm)
  const submit = useFarmSubmit(farm, setFarm)
  const settings = useAccountSettings()

  // Gated tabs stay unreachable until the farm has cleared admin review —
  // being a complete draft or pending review isn't enough (see farmActive).
  function handleNavClick(key: Section) {
    if (gatedSections.includes(key) && !farmActive) return
    sessionStorage.setItem('dashboardSection', key)
    setActiveSection(key)
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <DashboardSidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        farmActive={farmActive}
      />

      <main className="flex-1 p-8">
        {loading ? (
          <p className="text-brand-muted text-sm">Loading…</p>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{loadError}</p>
            </div>
            <button
              onClick={retryFarm}
              className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Skip on Farm Info — its own status banner (draft/pending/rejected)
                already covers this — and on Settings, which was never actually
                locked (password change / delete account always work), so the
                "these features are locked" message doesn't belong there. */}
            {!farmActive && activeSection !== 'farm-info' && activeSection !== 'settings' && (
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p>
                  {farm?.status === 'pending'
                    ? "Your farm is pending admin review. Horse management and other features will unlock once it's approved."
                    : 'Your farm must be complete and approved before you can unlock these features. Head to the Farm Info tab to finish your profile and submit for review.'}
                </p>
              </div>
            )}

            {activeSection === 'farm-info' && (
              <FarmInfoSection farm={farm} setFarm={setFarm} info={info} documents={documents} submit={submit} />
            )}

            {activeSection === 'horse-management' && (
              <HorseManagementSection
                horses={horses}
                setHorses={setHorses}
                horsesError={horsesError}
                onRetry={retryHorses}
                onAddHorse={() => navigate('/dashboard/farmer/horses/new')}
              />
            )}

            {activeSection === 'availability' && (
              <AvailabilitySection
                farm={farm}
                horses={horses}
                horsesError={horsesError}
                onRetryHorses={retryHorses}
              />
            )}

            {activeSection === 'visitor-management' && (
              <div>
                <h2 className="text-2xl font-bold text-brand-gold mb-2">Visitor Management</h2>
                <p className="text-brand-muted text-sm mb-6">
                  Everyone who has booked a visit to your farm. Use their contact details to reach
                  out, and check each visit&rsquo;s status.
                </p>
                <VisitorManagement />
              </div>
            )}

            {activeSection === 'donations' && (
              <div>
                <h2 className="text-2xl font-bold text-brand-gold mb-2">Donations</h2>
                <p className="text-brand-muted text-sm mb-6">
                  Connect Stripe to receive donations, and keep track of the support your farm has
                  received.
                </p>
                <DonationManagement />
              </div>
            )}

            {activeSection === 'settings' && <SettingsSection settings={settings} />}
          </>
        )}
      </main>
    </div>
  )
}

export default FarmerDashboardPage
