import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListBarberAppointmentsUseCase } from '@/use-cases/factories/make-list-barber-appointments-use-case'

export async function listMyBarberAppointmentsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const useCase = makeListBarberAppointmentsUseCase()
  try {
    const { appointments } = await useCase.execute({ userId: req.user.sub })
    return reply.send({ appointments })
  } catch (error) {
    return reply.status(403).send({ message: 'Acesso permitido apenas a barbeiros.' })
  }
}
