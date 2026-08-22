import { DOCUMENT_TYPES, type DocumentType, type HorseDocument } from '../api/horse'

// Which of the 3 required document types are missing from a horse's uploads.
// Re-uploading a type adds a new row rather than replacing it, so this checks
// presence by type, not array length.
export function missingDocumentTypes(documents: HorseDocument[] | undefined): DocumentType[] {
  return DOCUMENT_TYPES.filter(t => !documents?.some(d => d.document_type === t.key)).map(t => t.key)
}

export function hasAllDocumentTypes(documents: HorseDocument[] | undefined): boolean {
  return missingDocumentTypes(documents).length === 0
}
