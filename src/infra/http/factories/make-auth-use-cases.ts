import {
  AuthenticateUserUseCase,
  CreateSessionUseCase,
  DestroySessionUseCase,
  GetCurrentUserUseCase,
  RegisterUserUseCase,
  ResolveSessionUseCase,
} from '@/domain/auth/application/use-cases/auth-use-cases'
import { GetEnrichedAuthUserUseCase } from '@/domain/auth/application/use-cases/get-enriched-auth-user'
import {
  sessionsRepository,
  trainersRepository,
  usersRepository,
} from './make-repositories'

export function makeRegisterUserUseCase() {
  return new RegisterUserUseCase(usersRepository)
}

export function makeAuthenticateUserUseCase() {
  return new AuthenticateUserUseCase(usersRepository)
}

export function makeGetEnrichedAuthUserUseCase() {
  return new GetEnrichedAuthUserUseCase(usersRepository, trainersRepository)
}

export function makeGetCurrentUserUseCase() {
  return new GetCurrentUserUseCase(usersRepository)
}

export function makeCreateSessionUseCase() {
  return new CreateSessionUseCase(sessionsRepository)
}

export function makeDestroySessionUseCase() {
  return new DestroySessionUseCase(sessionsRepository)
}

export function makeResolveSessionUseCase() {
  return new ResolveSessionUseCase(sessionsRepository, usersRepository)
}
