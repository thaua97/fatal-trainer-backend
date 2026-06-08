export interface SessionCookieWriter {
  setSession(token: string): void
  setAdminBackup(token: string): void
  clearSession(): void
  clearAdminBackup(): void
}
