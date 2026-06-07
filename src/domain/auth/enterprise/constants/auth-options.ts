export const AUTH_PASSWORD_MIN_LENGTH = 6

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
