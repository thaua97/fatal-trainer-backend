import type { FastifyReply, FastifyRequest } from 'fastify'
import { mapErrorToResponse } from './map-error-to-response'

type RouteHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<unknown>

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, reply) => {
    try {
      return await handler(request, reply)
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  }
}
