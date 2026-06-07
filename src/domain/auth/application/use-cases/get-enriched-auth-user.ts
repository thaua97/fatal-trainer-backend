import type { AuthUser } from '@/domain/auth/enterprise/entities/user'
import {
  enrichAuthUserWithTrainer,
  mapStoredUserToAuthUser,
} from '@/domain/auth/enterprise/services/build-auth-user'
import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import { InvalidCredentialsError } from '@/domain/shared/errors/domain-errors'

export class GetEnrichedAuthUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly trainersRepository: PersonalTrainersRepository,
  ) {}

  async execute(userId: string, session?: { impersonatorUserId?: string }): Promise<AuthUser> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const authUser = mapStoredUserToAuthUser(user, session)
    const trainer = await this.trainersRepository.findByUserId(userId)

    return enrichAuthUserWithTrainer(authUser, trainer)
  }
}
