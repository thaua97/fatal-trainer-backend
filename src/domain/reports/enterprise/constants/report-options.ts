export const REPORT_TYPES = [
  'abuse',
  'offense',
  'wrong_pricing',
  'fake_profile',
  'harassment',
  'spam',
  'other',
  // Legacy value kept for existing records
  'inappropriate_content',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_TYPE_SET = new Set<string>(REPORT_TYPES)
