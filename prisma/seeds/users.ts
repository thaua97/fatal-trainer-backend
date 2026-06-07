import { hash } from 'bcryptjs'
import type { PrismaClient, UserRole } from '@prisma/client'
import { PersonalTrainer } from '../../src/domain/catalog/enterprise/entities/personal-trainer'
import {
  makePersonalTrainerProps,
} from '../../src/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '../../src/infra/database/prisma/mappers/prisma-mapper'

export const SEED_PASSWORD = '123456'
export const ADMIN_SEED_PASSWORD = 'Admin@Fatal2026!'

export interface SeedUser {
  name: string
  email: string
  role: UserRole
  phoneNumber?: string
  withTrainerProfile?: boolean
  password?: string
}

export const SEED_USERS: SeedUser[] = [
  {
    name: 'Admin Fatal',
    email: 'admin@fataltrainer.com',
    role: 'admin',
    password: ADMIN_SEED_PASSWORD,
    phoneNumber: '11987654321',
  },
  {
    name: 'Ana Aluno',
    email: 'aluno@fataltrainer.com',
    role: 'student',
    phoneNumber: '11999887766',
  },
  {
    name: 'Maria Estudante',
    email: 'maria@fataltrainer.com',
    role: 'student',
    phoneNumber: '21988776655',
  },
  {
    name: 'Carlos Personal',
    email: 'personal@fataltrainer.com',
    role: 'personal_trainer',
    phoneNumber: '53991625225',
    withTrainerProfile: true,
  },
  {
    name: 'Bruno Treinador',
    email: 'bruno@fataltrainer.com',
    role: 'personal_trainer',
    phoneNumber: '11976543210',
    withTrainerProfile: true,
  },
]

export async function seedUsers(prisma: PrismaClient) {
  for (const [index, user] of SEED_USERS.entries()) {
    const password = user.password ?? SEED_PASSWORD
    const passwordHash = await hash(password, 10)

    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
        phone_number: user.phoneNumber ?? null,
        avatar_url: user.withTrainerProfile ? makePersonalTrainerProps(index).photoUrl : null,
      },
    })

    if (user.withTrainerProfile) {
      const trainerProps = makePersonalTrainerProps(index)
      const trainer = PersonalTrainer.create(
        {
          ...trainerProps,
          name: created.name,
          userId: created.id,
          contactPhone: user.phoneNumber ?? trainerProps.contactPhone,
        },
        `seed-trainer-${index}`,
      )

      await prisma.user.update({
        where: { id: created.id },
        data: {
          city: trainerProps.city ?? null,
          state: trainerProps.state ?? null,
        },
      })

      await prisma.personalTrainer.create({
        data: mapTrainerToPrisma(trainer),
      })
    }
  }

  console.log(`Seeded ${SEED_USERS.length} users`)
}
