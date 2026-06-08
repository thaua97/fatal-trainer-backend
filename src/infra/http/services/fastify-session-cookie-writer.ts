import type { FastifyReply } from 'fastify'
import type { SessionCookieWriter } from '@/domain/auth/application/ports/session-cookie-writer'
import {
  clearAdminBackupCookie,
  clearSessionCookie,
  setAdminBackupCookie,
  setSessionCookie,
} from '../middlewares/session'

export function createFastifySessionCookieWriter(reply: FastifyReply): SessionCookieWriter {
  return {
    setSession(token: string) {
      setSessionCookie(reply, token)
    },
    setAdminBackup(token: string) {
      setAdminBackupCookie(reply, token)
    },
    clearSession() {
      clearSessionCookie(reply)
    },
    clearAdminBackup() {
      clearAdminBackupCookie(reply)
    },
  }
}
