// Badge styling and labels for farm/horse admin-review status, shown on the
// farmer dashboard so farmers can see where their farm/horses stand.

export const FARM_STATUS_STYLES: Record<'pending' | 'active' | 'rejected', string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40',
  active: 'bg-green-500/10 text-green-600 border-green-500/40',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/40',
}

export const FARM_STATUS_LABELS: Record<'pending' | 'active' | 'rejected', string> = {
  pending: 'Pending Review',
  active: 'Active',
  rejected: 'Rejected',
}

export const HORSE_STATUS_STYLES: Record<'draft' | 'pending' | 'approved' | 'rejected', string> = {
  draft: 'bg-brand-border/40 text-brand-muted border-brand-border',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40',
  approved: 'bg-green-500/10 text-green-600 border-green-500/40',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/40',
}

export const HORSE_STATUS_LABELS: Record<'draft' | 'pending' | 'approved' | 'rejected', string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
}
