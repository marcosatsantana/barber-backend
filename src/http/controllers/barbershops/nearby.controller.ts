import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchNearbyBarbershopsUseCase } from '../../../use-cases/factories/make-fetch-nearby-barbershops-use-case'

export async function fetchNearbyBarbershopsController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radiusInKm: z.coerce.number().positive().max(50).optional(),
  })

  const { latitude, longitude, radiusInKm } = querySchema.parse(req.query)
  const useCase = makeFetchNearbyBarbershopsUseCase()
  const { barbershops } = await useCase.execute({ latitude, longitude, radiusInKm })
  return reply.status(200).send({ barbershops })
}


