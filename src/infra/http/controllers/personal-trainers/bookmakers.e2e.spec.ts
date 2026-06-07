import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { app } from '@/app'
import { prisma } from '@/libs/prisma'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '@/infra/database/prisma/mappers/prisma-mapper'

describe('Bookmakers and Reports E2E', () => {
  let cookie: string[]
  let trainerId: string

  beforeAll(async () => {
    await app.ready()
    await prisma.report.deleteMany()
    await prisma.favorite.deleteMany()
    await prisma.session.deleteMany()
    await prisma.personalTrainer.deleteMany()
    await prisma.user.deleteMany()

    await prisma.personalTrainer.createMany({
      data: generateMockTrainers(3).map(mapTrainerToPrisma),
    })

    trainerId = 'trainer-001'

    await prisma.user.create({
      data: {
        name: 'Student',
        email: 'student@example.com',
        password_hash: await hash('123456', 10),
        role: 'student',
      },
    })

    const login = await request(app.server)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: '123456' })

    cookie = login.headers['set-cookie']
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('POST /api/personal-trainers/bookmakers/:id adds favorite', async () => {
    const response = await request(app.server)
      .post(`/api/personal-trainers/bookmakers/${trainerId}`)
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(201)
  })

  it('GET /api/personal-trainers/bookmakers lists favorites', async () => {
    const response = await request(app.server)
      .get('/api/personal-trainers/bookmakers')
      .set('Cookie', cookie)

    expect(response.statusCode).toBe(200)
    expect(response.body.items.length).toBeGreaterThan(0)
  })

  it('POST /api/reports creates report', async () => {
    const response = await request(app.server).post('/api/reports').send({
      type: 'other',
      occurredAt: '2026-06-01',
      trainerId,
      description: 'Relato detalhado da denúncia para validação do endpoint.',
      contactEmail: 'student@example.com',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body.id).toBeDefined()
  })
})
