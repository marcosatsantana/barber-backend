import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetBarberProfileUseCase } from '../../../use-cases/factories/make-get-barber-profile-use-case'

export async function getBarberProfileController(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const useCase = makeGetBarberProfileUseCase()
  const { barber } = await useCase.execute({ barberId: id })
  if (!barber) return reply.status(404).send({ message: 'Barber not found' })
  return reply.status(200).send({ barber })
}


