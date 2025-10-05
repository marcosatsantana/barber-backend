import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaBarbershopsRepository } from '@/repositorys/prisma/prisma-barbershops-repository'

export async function searchBarbershopsController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    query: z.string().min(1),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radiusInKm: z.coerce.number().min(0).max(50).default(50),
    limit: z.coerce.number().min(1).max(10).default(10),
  })

  const { query, latitude, longitude, radiusInKm, limit } = querySchema.parse(req.query)

  const repo = new PrismaBarbershopsRepository()
  const items = await repo.searchNearbyByQuery({ query, latitude, longitude, radiusInKm, limit })
  return reply.status(200).send({ barbershops: items })
}