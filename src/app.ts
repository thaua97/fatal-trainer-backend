import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { join } from 'node:path'
import { ZodError } from 'zod'
import { env } from '@/env'
import { personalTrainersRoutes } from '@/infra/http/controllers/personal-trainers/list-trainers.controller'
import { myTrainerRoutes } from '@/infra/http/controllers/personal-trainers/my-trainer.controller'
import { bookmakersRoutes } from '@/infra/http/controllers/personal-trainers/bookmakers.controller'
import { trainerReviewsRoutes } from '@/infra/http/controllers/personal-trainers/trainer-reviews.controller'
import { authRoutes } from '@/infra/http/controllers/auth/auth.controller'
import { reportsRoutes } from '@/infra/http/controllers/reports/reports.controller'
import { adminRoutes } from '@/infra/http/controllers/admin/admin.controller'
import { mapErrorToResponse } from '@/infra/http/errors/map-error-to-response'

export const app = fastify()

app.register(fastifyCors, {
  origin: true,
  credentials: true,
})

app.register(fastifyCookie)
app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

app.register(async (api) => {
  await api.register(myTrainerRoutes)
  await api.register(bookmakersRoutes)
  await api.register(trainerReviewsRoutes)
  await api.register(personalTrainersRoutes)
  await api.register(authRoutes)
  await api.register(reportsRoutes)
  await api.register(adminRoutes)
}, { prefix: '/api' })

app.get('/uploads/*', async (request, reply) => {
  const { createReadStream, existsSync } = await import('node:fs')
  const relativePath = (request.params as { '*': string })['*']
  const filePath = join(process.cwd(), env.UPLOAD_DIR, relativePath)

  if (!existsSync(filePath)) {
    return reply.status(404).send({ message: 'File not found' })
  }

  return reply.send(createReadStream(filePath))
})

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.format(),
    })
  }

  const mapped = mapErrorToResponse(error)
  return reply.status(mapped.statusCode).send(mapped.body)
})

export { env }
