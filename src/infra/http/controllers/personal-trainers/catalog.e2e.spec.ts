import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/libs/prisma'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '@/infra/database/prisma/mappers/prisma-mapper'

describe('Catalog E2E', () => {
  beforeAll(async () => {
    await app.ready()
    await prisma.personalTrainer.deleteMany()
    await prisma.personalTrainer.createMany({
      data: generateMockTrainers(10).map(mapTrainerToPrisma),
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/personal-trainers returns paginated list', async () => {
    const response = await request(app.server).get('/api/personal-trainers?pageSize=5')

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(5)
    expect(response.body.total).toBe(10)
    expect(response.body.hasMore).toBe(true)
  })

  it('GET /api/personal-trainers/featured returns featured trainers', async () => {
    const response = await request(app.server).get('/api/personal-trainers/featured')
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('GET /api/personal-trainers/:id returns trainer or 404', async () => {
    const list = await request(app.server).get('/api/personal-trainers?pageSize=1')
    const id = list.body.items[0].id

    const response = await request(app.server).get(`/api/personal-trainers/${id}`)
    expect(response.statusCode).toBe(200)
    expect(response.body.trainer.id).toBe(id)

    const missing = await request(app.server).get('/api/personal-trainers/missing-id')
    expect(missing.statusCode).toBe(404)
  })
})
