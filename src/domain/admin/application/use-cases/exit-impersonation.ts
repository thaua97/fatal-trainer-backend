import { ValidationError } from '@/domain/shared/errors/domain-errors'
import type { AuthUser } from '@/domain/auth/enterprise/entities/user'
import type { SessionCookieWriter } from '@/domain/auth/application/ports/session-cookie-writer'
import type { DestroySessionUseCase } from '@/domain/auth/application/use-cases/auth-use-cases'

export class ExitImpersonationUseCase {
  constructor(private readonly destroySession: DestroySessionUseCase) {}

  async execute(params: {
    sessionUser: AuthUser
    currentToken: string | undefined
    adminBackupToken: string | undefined
    cookies: SessionCookieWriter
  }): Promise<void> {
    if (!params.sessionUser.isImpersonating) {
      throw new ValidationError({ impersonation: 'notActive' })
    }

    if (params.currentToken) {
      await this.destroySession.execute(params.currentToken)
    }

    if (params.adminBackupToken) {
      params.cookies.setSession(params.adminBackupToken)
      params.cookies.clearAdminBackup()
    } else {
      params.cookies.clearSession()
    }
  }
}
