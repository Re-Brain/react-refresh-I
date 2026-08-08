import { FARM_DOCUMENT_TYPES, type FarmDocumentType, type FarmDocument } from '../api/farm'

// Which of the 3 required document types are missing from a farm's uploads.
// Re-uploading a type adds a new row rather than replacing it, so this checks
// presence by type, not array length.
export function missingFarmDocumentTypes(documents: FarmDocument[] | undefined): FarmDocumentType[] {
  return FARM_DOCUMENT_TYPES.filter(t => !documents?.some(d => d.document_type === t.key)).map(t => t.key)
}

export function hasAllFarmDocumentTypes(documents: FarmDocument[] | undefined): boolean {
  return missingFarmDocumentTypes(documents).length === 0
}
