import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError, ForbiddenError } from '@/domain/shared/errors/domain-errors'
import { makeResolveSessionUseCase } from '../factories/make-use-cases'
import { ADMIN_BACKUP_SESSION_COOKIE, SESSION_COOKIE } from '../constants/session'

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
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function setAdminBackupCookie(reply: FastifyReply, token: string) {
  reply.setCookie(ADMIN_BACKUP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, { path: '/' })
}

export function clearAdminBackupCookie(reply: FastifyReply) {
  reply.clearCookie(ADMIN_BACKUP_SESSION_COOKIE, { path: '/' })
}
