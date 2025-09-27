import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetBarbershopUseCase } from '../../../use-cases/factories/make-get-barbershop-use-case'

export async function getBarbershopController(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const querySchema = z.object({
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  const { id } = paramsSchema.parse(req.params)
  const { latitude, longitude } = querySchema.parse(req.query)

  const useCase = makeGetBarbershopUseCase()
  const { barbershop } = await useCase.execute({ id, userLocation: { latitude, longitude } })
  if (!barbershop) return reply.status(404).send({ message: 'Barbershop not found' })
  return reply.status(200).send({ barbershop })
}


