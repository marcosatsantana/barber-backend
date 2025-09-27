import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchBarberAvailabilityUseCase } from '../../../use-cases/factories/make-fetch-barber-availability-use-case'

export async function fetchBarberAvailabilityController(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

  const { id } = paramsSchema.parse(req.params)
  const { date } = querySchema.parse(req.query)

  const useCase = makeFetchBarberAvailabilityUseCase()
  const { slots } = await useCase.execute({ barberId: id, date })
  return reply.status(200).send({ slots })
}


