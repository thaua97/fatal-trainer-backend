import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { app } from '@/app'
import { prisma } from '@/libs/prisma'

describe('Auth E2E', () => {
  beforeAll(async () => {
    await app.ready()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()

    await prisma.user.create({
      data: {
        name: 'Seed User',
        email: 'seed@fataltrainer.com',
        password_hash: await hash('123456', 10),
        role: 'student',
      },
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/auth/login sets session cookie', async () => {
    const response = await request(app.server)
      .post('/api/auth/login')
      .send({ email: 'seed@fataltrainer.com', password: '123456' })

    expect(response.statusCode).toBe(200)
    expect(response.body.user.email).toBe('seed@fataltrainer.com')
    expect(response.headers['set-cookie']).toBeDefined()
  })

  it('POST /api/auth/login returns stable error contract for invalid credentials', async () => {
    const response = await request(app.server)
      .post('/api/auth/login')
      .send({ email: 'seed@fataltrainer.com', password: 'wrong-password' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      message: 'error.invalidCredentials',
      errors: { email: 'invalidCredentials' },
    })
  })

  it('GET /api/auth/me requires session', async () => {
    const login = await request(app.server)
      .post('/api/auth/login')
      .send({ email: 'seed@fataltrainer.com', password: '123456' })

    const cookie = login.headers['set-cookie']
    const me = await request(app.server).get('/api/auth/me').set('Cookie', cookie)

    expect(me.statusCode).toBe(200)
    expect(me.body.user.email).toBe('seed@fataltrainer.com')
  })

  it('GET /api/auth/me returns stable error contract without session', async () => {
    const response = await request(app.server).get('/api/auth/me')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ message: 'error.unauthorized' })
  })
})
