import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateBarberUseCase } from '../../../use-cases/factories/make-create-barber-use-case'

export async function createBarberController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    userId: z.string().uuid(),
    barbershopId: z.string().uuid(),
  })

  const { userId, barbershopId } = bodySchema.parse(req.body)

  const useCase = makeCreateBarberUseCase()
  const { barber } = await useCase.execute({ userId, barbershopId })

  return reply.status(201).send({ barber })
}


