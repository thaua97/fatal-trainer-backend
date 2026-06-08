import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { app } from '@/app'
import { prisma } from '@/libs/prisma'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '@/infra/database/prisma/mappers/prisma-mapper'
import { SESSION_COOKIE } from '@/infra/http/constants/session'

describe('Trainer Reviews E2E', () => {
  let trainerId: string
  let studentToken: string
  let trainerUserId: string
  let trainerToken: string

  beforeAll(async () => {
    await app.ready()

    await prisma.trainerReview.deleteMany()
    await prisma.session.deleteMany()
    await prisma.personalTrainer.deleteMany()
    await prisma.user.deleteMany()

    const trainers = generateMockTrainers(3).map(mapTrainerToPrisma)
    await prisma.personalTrainer.createMany({ data: trainers })
    trainerId = trainers[0]!.id

    const passwordHash = await hash('123456', 10)

    const student = await prisma.user.create({
      data: {
        name: 'Student Reviewer',
        email: 'review-student@test.com',
        password_hash: passwordHash,
        role: 'student',
      },
    })

    const trainerUser = await prisma.user.create({
      data: {
        name: 'Trainer Owner',
        email: 'review-trainer@test.com',
        password_hash: passwordHash,
        role: 'personal_trainer',
      },
    })
    trainerUserId = trainerUser.id

    await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { user_id: trainerUserId },
    })

    const studentSession = await prisma.session.create({
      data: { token: 'review-student-token', user_id: student.id },
    })
    studentToken = studentSession.token

    const trainerSession = await prisma.session.create({
      data: { token: 'review-trainer-token', user_id: trainerUserId },
    })
    trainerToken = trainerSession.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('lists reviews with pagination defaults', async () => {
    const response = await request(app.server).get(`/api/personal-trainers/${trainerId}/reviews`)

    expect(response.statusCode).toBe(200)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(10)
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('creates and updates a review for authenticated user', async () => {
    const createResponse = await request(app.server)
      .post(`/api/personal-trainers/${trainerId}/reviews`)
      .set('Cookie', `${SESSION_COOKIE}=${studentToken}`)
      .send({ rating: 4.5, comment: 'Primeira avaliação publicada aqui.' })

    expect(createResponse.statusCode).toBe(201)
    expect(createResponse.body.review.rating).toBe(4.5)
    expect(createResponse.body.created).toBe(true)

    const updateResponse = await request(app.server)
      .post(`/api/personal-trainers/${trainerId}/reviews`)
      .set('Cookie', `${SESSION_COOKIE}=${studentToken}`)
      .send({ rating: 5, comment: 'Atualizei minha avaliação positivamente.' })

    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.body.created).toBe(false)
    expect(updateResponse.body.review.rating).toBe(5)

    const mineResponse = await request(app.server)
      .get(`/api/personal-trainers/${trainerId}/reviews/mine`)
      .set('Cookie', `${SESSION_COOKIE}=${studentToken}`)

    expect(mineResponse.statusCode).toBe(200)
    expect(mineResponse.body.review.rating).toBe(5)
  })

  it('blocks trainer from reviewing own profile', async () => {
    const response = await request(app.server)
      .post(`/api/personal-trainers/${trainerId}/reviews`)
      .set('Cookie', `${SESSION_COOKIE}=${trainerToken}`)
      .send({ rating: 5, comment: 'Auto avaliação não permitida.' })

    expect(response.statusCode).toBe(403)
  })

  it('requires auth for mine and post', async () => {
    const mine = await request(app.server).get(`/api/personal-trainers/${trainerId}/reviews/mine`)
    expect(mine.statusCode).toBe(401)

    const post = await request(app.server)
      .post(`/api/personal-trainers/${trainerId}/reviews`)
      .send({ rating: 4, comment: 'Sem autenticação aqui.' })
    expect(post.statusCode).toBe(401)
  })
})
