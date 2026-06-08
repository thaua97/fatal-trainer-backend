import type { ZodError } from 'zod'

function flattenIssues(
  issues: ZodError['issues'],
  prefix = '',
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const issue of issues) {
    const path = issue.path.length > 0
      ? issue.path.map(String).join('.')
      : prefix || 'form'
    const field = prefix ? `${prefix}.${path}` : path

    if (!errors[field]) {
      errors[field] = issue.code === 'invalid_type' && issue.received === 'undefined'
        ? 'required'
        : 'invalid'
    }
  }

  return errors
}

export function flattenZodErrors(error: ZodError): Record<string, string> {
  return flattenIssues(error.issues)
}
