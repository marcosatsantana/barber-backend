import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchNearbyBarbershopsUseCase } from '../../../use-cases/factories/make-fetch-nearby-barbershops-use-case'

export async function fetchNearbyBarbershopsController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radiusInKm: z.coerce.number().positive().max(50).optional(),
    ratingMin: z.coerce.number().min(0).max(5).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    services: z.string().optional(), // CSV
  })

  const { latitude, longitude, radiusInKm, ratingMin, priceMin, priceMax, services } = querySchema.parse(req.query)
  const servicesList = services ? services.split(',').map((s) => s.trim()).filter(Boolean) : undefined

  const useCase = makeFetchNearbyBarbershopsUseCase()
  const { barbershops } = await useCase.execute({
    latitude,
    longitude,
    radiusInKm,
    ratingMin,
    priceMin,
    priceMax,
    services: servicesList,
  })
  return reply.status(200).send({ barbershops })
}


