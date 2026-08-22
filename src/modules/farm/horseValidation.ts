// Shared horse field validation, used by both the add and edit forms.
// Every field is required. Horse/pedigree names follow Jockey Club style:
// <=18 chars, letters plus spaces/hyphens/apostrophes, starting with a letter.
export const NAME_MAX = 18
const NAME_PATTERN = /^[A-Za-z][A-Za-z '-]*$/
export const COLOR_MAX = 20
const COLOR_PATTERN = /^[A-Za-z][A-Za-z ]*$/
// No retired racehorse is plausibly older than this; also guards against typos.
const MAX_AGE_YEARS = 40

// `required` defaults to true (the pre-existing behavior everywhere except a
// draft horse's edit form, which allows saving these fields blank).
export function validateName(value: string, label: string, required = true): string | null {
  const v = value.trim()
  if (!v) return required ? `${label} is required.` : null
  if (v.length > NAME_MAX) return `${label} must be ${NAME_MAX} characters or fewer.`
  if (!NAME_PATTERN.test(v)) return `${label} can only contain letters, spaces, hyphens, and apostrophes.`
  return null
}

export function validateColor(value: string, required = true): string | null {
  const v = value.trim()
  if (!v) return required ? 'Color is required.' : null
  if (v.length > COLOR_MAX) return `Color must be ${COLOR_MAX} characters or fewer.`
  if (!COLOR_PATTERN.test(v)) return 'Color can only contain letters and spaces.'
  return null
}

export function validateDob(value: string, required = true): string | null {
  if (!value) return required ? 'Date of birth is required.' : null
  const today = new Date()
  if (value > today.toISOString().slice(0, 10)) return 'Date of birth cannot be in the future.'
  const earliest = new Date(today.getFullYear() - MAX_AGE_YEARS, today.getMonth(), today.getDate())
  if (value < earliest.toISOString().slice(0, 10)) return `Date of birth cannot be more than ${MAX_AGE_YEARS} years ago.`
  return null
}
