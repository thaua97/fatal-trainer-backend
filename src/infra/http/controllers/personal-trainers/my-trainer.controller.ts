import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  makeDeleteGalleryImageUseCase,
  makeGetOrCreateMyTrainerUseCase,
  makeResolveMyTrainerUseCase,
  makeSetGalleryCoverUseCase,
  makeUpdateMyTrainerUseCase,
  makeUploadMyTrainerGalleryUseCase,
} from '../../factories/make-use-cases'
import { presentTrainer, presentTrainerDetail } from '../../presenters/trainer-presenter'
import { requireTrainerSession } from '../../middlewares/session'
import { makeFileStorage } from '../../factories/make-file-storage'
import { ValidationError } from '@/domain/shared/errors/domain-errors'

const updateSchema = z.object({
  section: z.enum(['info', 'promotion']),
  info: z
    .object({
      name: z.string(),
      contactPhone: z.string(),
      profession: z.string(),
      description: z.string(),
      specialties: z.array(z.string()),
      modalities: z.array(z.enum(['presencial', 'online', 'hibrido'])),
      city: z.string(),
      state: z.string(),
      servicePrice: z.number(),
      cref: z.string(),
      availability: z.string(),
      experienceYears: z.number(),
    })
    .optional(),
  promotion: z
    .object({
      templateId: z.string().nullable(),
    })
    .optional(),
})

export async function myTrainerRoutes(app: FastifyInstance) {
  app.get('/personal-trainers/me', async (request, reply) => {
    const user = await requireTrainerSession(request)
    const useCase = makeGetOrCreateMyTrainerUseCase()
    const result = await useCase.execute(user)
    return reply.send({ trainer: presentTrainer(result.trainer), created: result.created })
  })

  app.patch('/personal-trainers/me', async (request, reply) => {
    const user = await requireTrainerSession(request)
    const body = updateSchema.parse(request.body)
    const trainer = await makeResolveMyTrainerUseCase().execute(user.id)

    const useCase = makeUpdateMyTrainerUseCase()
    const updated = await useCase.execute({
      trainerId: trainer.id,
      section: body.section,
      info: body.info,
      promotion: body.promotion,
    })

    return reply.send(presentTrainerDetail(updated))
  })

  app.post('/personal-trainers/me/gallery', async (request, reply) => {
    const user = await requireTrainerSession(request)
    const file = await request.file()
    if (!file) {
      throw new ValidationError({ file: 'required' })
    }

    const useCase = makeUploadMyTrainerGalleryUseCase()
    const { url, trainer } = await useCase.execute(
      user.id,
      {
        filename: file.filename,
        mimetype: file.mimetype,
        file: file.file,
      },
      file.file.truncated,
    )

    return reply.send({ url, gallery: trainer.props.gallery ?? [] })
  })

  app.delete('/personal-trainers/me/gallery/:index', async (request, reply) => {
    const user = await requireTrainerSession(request)
    const trainer = await makeResolveMyTrainerUseCase().execute(user.id)

    const { index } = request.params as { index: string }
    const imageIndex = Number(index)
    const gallery = trainer.props.gallery ?? []

    if (imageIndex < 0 || imageIndex >= gallery.length) {
      throw new ValidationError({ gallery: 'notFound' })
    }

    const removedUrl = gallery[imageIndex]
    const useCase = makeDeleteGalleryImageUseCase()
    const updated = await useCase.execute(trainer.id, imageIndex)

    try {
      await makeFileStorage().deleteGalleryImage(removedUrl)
    } catch (storageError) {
      request.log.error({ err: storageError, removedUrl }, 'Failed to delete gallery image from storage')
    }

    return reply.send(presentTrainerDetail(updated))
  })

  app.patch('/personal-trainers/me/gallery/cover', async (request, reply) => {
    const user = await requireTrainerSession(request)
    const trainer = await makeResolveMyTrainerUseCase().execute(user.id)

    const body = z.object({ imageUrl: z.string() }).parse(request.body)
    const useCase = makeSetGalleryCoverUseCase()
    const updated = await useCase.execute(trainer.id, body.imageUrl)

    return reply.send(presentTrainerDetail(updated))
  })
}
