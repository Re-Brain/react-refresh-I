import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAddHorseForm } from '../hooks/useAddHorseForm'
import HorseImageDraftEditor from '../components/HorseImageDraftEditor'
import HorseFormFields from '../components/HorseFormFields'
import RaceRecordDraftTable from '../components/RaceRecordDraftTable'

function AddHorsePage() {
  const navigate = useNavigate()
  const { form, setForm, saving, error, handleSubmit, imageDraft, recordDraft } = useAddHorseForm()

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard/farmer')}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Management
      </button>

      <h1 className="text-2xl font-bold text-brand-gold mb-8">Add New Horse</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <HorseImageDraftEditor draft={imageDraft} />
        <HorseFormFields form={form} setForm={setForm} />
        <RaceRecordDraftTable draft={recordDraft} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Horse'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-brand-muted hover:text-brand-text font-bold px-6 py-2 rounded-lg border border-brand-border transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddHorsePage
