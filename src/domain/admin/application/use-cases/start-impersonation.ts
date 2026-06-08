import { randomUUID } from 'node:crypto'
import type { AuthUser } from '@/domain/auth/enterprise/entities/user'
import type { SessionCookieWriter } from '@/domain/auth/application/ports/session-cookie-writer'
import {
  type CreateSessionUseCase,
  type DestroySessionUseCase,
} from '@/domain/auth/application/use-cases/auth-use-cases'
import type { ImpersonateUserUseCase } from './admin-users-use-cases'

export class StartImpersonationUseCase {
  constructor(
    private readonly impersonateUser: ImpersonateUserUseCase,
    private readonly createSession: CreateSessionUseCase,
    private readonly destroySession: DestroySessionUseCase,
  ) {}

  async execute(params: {
    adminUserId: string
    targetUserId: string
    currentToken: string | undefined
    cookies: SessionCookieWriter
  }): Promise<AuthUser> {
    const user = await this.impersonateUser.execute(params.adminUserId, params.targetUserId)

    if (params.currentToken) {
      params.cookies.setAdminBackup(params.currentToken)
      await this.destroySession.execute(params.currentToken)
    }

    const token = randomUUID()
    await this.createSession.execute(user.id, token, params.adminUserId)
    params.cookies.setSession(token)

    return user
  }
}
