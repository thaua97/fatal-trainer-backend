import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/env'
import { UnauthorizedError, ForbiddenError } from '@/domain/shared/errors/domain-errors'
import { makeResolveSessionUseCase } from '../factories/make-use-cases'
import {
  ADMIN_BACKUP_SESSION_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '../constants/session'

const isCrossOriginDeployment = env.NODE_ENV === 'prod'

function sessionCookieAttributes() {
  return {
    httpOnly: true,
    sameSite: isCrossOriginDeployment ? 'none' as const : 'lax' as const,
    secure: isCrossOriginDeployment,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  }
}

export async function resolveSession(request: FastifyRequest) {
  const token = request.cookies[SESSION_COOKIE]
  const resolveSessionUseCase = makeResolveSessionUseCase()
  return resolveSessionUseCase.execute(token)
}

export async function requireSession(request: FastifyRequest) {
  const user = await resolveSession(request)
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

export async function requireTrainerSession(request: FastifyRequest) {
  const user = await requireSession(request)
  if (user.role !== 'personal-trainer') {
    throw new ForbiddenError()
  }
  return user
}

export async function requireAdminSession(request: FastifyRequest) {
  const user = await requireSession(request)
  if (user.role !== 'admin') {
    throw new ForbiddenError()
  }
  return user
}

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, sessionCookieAttributes())
}

export function setAdminBackupCookie(reply: FastifyReply, token: string) {
  reply.setCookie(ADMIN_BACKUP_SESSION_COOKIE, token, sessionCookieAttributes())
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, sessionCookieAttributes())
}

export function clearAdminBackupCookie(reply: FastifyReply) {
  reply.clearCookie(ADMIN_BACKUP_SESSION_COOKIE, sessionCookieAttributes())
}
