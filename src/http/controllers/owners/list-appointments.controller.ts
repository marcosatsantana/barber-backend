import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListOwnerAppointmentsUseCase } from '@/use-cases/factories/make-list-owner-appointments-use-case'

export async function listOwnerAppointmentsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }
  if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Acesso permitido apenas a donos.' })
  }

  const useCase = makeListOwnerAppointmentsUseCase()
  const { appointments } = await useCase.execute({ ownerId: req.user.sub })
  return reply.send({ appointments })
}
