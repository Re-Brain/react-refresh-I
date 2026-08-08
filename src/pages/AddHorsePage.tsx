import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAddHorseForm } from '../hooks/useAddHorseForm'
import { DOCUMENT_TYPES } from '../api/horse'
import HorseImageDraftEditor from '../components/HorseImageDraftEditor'
import HorseFormFields from '../components/HorseFormFields'
import RaceRecordDraftTable from '../components/RaceRecordDraftTable'
import HorseDocumentDraftEditor from '../components/HorseDocumentDraftEditor'
import HorseReviewSummary from '../components/HorseReviewSummary'

type Step = 1 | 2 | 3

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Horse Details' },
  { step: 2, label: 'Proof Documents' },
  { step: 3, label: 'Review & Submit' },
]

function AddHorsePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const {
    form,
    setForm,
    pendingAction,
    error,
    handleSaveDraft,
    handleSubmitForReview,
    imageDraft,
    recordDraft,
    documentDraft,
  } = useAddHorseForm()

  const busy = pendingAction !== null
  const missingDocs = DOCUMENT_TYPES.filter(t => !documentDraft.files[t.key])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard/farmer')}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Management
      </button>

      <h1 className="text-2xl font-bold text-brand-gold mb-6">Add New Horse</h1>

      {/* Step nav — jump directly to any section; the drafts live in the hook
          above, so nothing is lost switching between steps. */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-brand-border">
        {STEPS.map(s => (
          <button
            key={s.step}
            type="button"
            onClick={() => setStep(s.step)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
              step === s.step
                ? 'bg-brand-gold text-brand-bg border-brand-gold'
                : 'border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold'
            }`}
          >
            {s.step}. {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveDraft} className="flex flex-col gap-6">
        {step === 1 && (
          <section className="flex flex-col gap-6">
            <HorseImageDraftEditor draft={imageDraft} />
            <HorseFormFields form={form} setForm={setForm} />
            <RaceRecordDraftTable draft={recordDraft} />
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-col gap-6">
            <HorseDocumentDraftEditor draft={documentDraft} />
          </section>
        )}

        {step === 3 && (
          <section className="flex flex-col gap-6">
            <HorseReviewSummary form={form} imageDraft={imageDraft} documentDraft={documentDraft} recordDraft={recordDraft} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </section>
        )}

        <div className="flex items-center justify-between gap-3 pt-6 mt-2 border-t border-brand-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={busy}
            className="text-brand-muted hover:text-brand-text font-bold px-6 py-2 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => (prev - 1) as Step)}
                disabled={busy}
                className="text-brand-muted hover:text-brand-text font-bold px-6 py-2 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => (prev + 1) as Step)}
                className="flex items-center gap-2 bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
                >
                  {pendingAction === 'draft' ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={busy || missingDocs.length > 0}
                  title={missingDocs.length > 0 ? `Missing: ${missingDocs.map(t => t.label).join(', ')}` : undefined}
                  className="bg-brand-surface text-brand-gold border border-brand-gold font-bold px-6 py-2 rounded-lg hover:bg-brand-gold hover:text-brand-bg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-surface disabled:hover:text-brand-gold"
                >
                  {pendingAction === 'submit' ? 'Submitting...' : 'Submit for Review'}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddHorsePage
