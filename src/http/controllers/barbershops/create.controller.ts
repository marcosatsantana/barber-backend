import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateBarbershopUseCase } from '../../../use-cases/factories/make-create-barbershop-use-case'

export async function createBarbershopController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    ownerId: z.string().uuid(),
    coverImageUrl: z.string().url().optional(),
  })

  const data = bodySchema.parse(req.body)
  const useCase = makeCreateBarbershopUseCase()
  const { barbershop } = await useCase.execute(data)
  return reply.status(201).send({ barbershop })
}


