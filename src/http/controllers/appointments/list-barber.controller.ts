import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListBarberAppointmentsUseCase } from '@/use-cases/factories/make-list-barber-appointments-use-case'

export async function listMyBarberAppointmentsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  })
  const { page, perPage, status, date } = querySchema.parse(req.query)

  const useCase = makeListBarberAppointmentsUseCase()
  try {
    const { appointments, total } = await useCase.execute({ userId: req.user.sub, page, perPage, status, date })
    const totalPages = Math.ceil(total / perPage)
    return reply.send({ appointments, pagination: { page, perPage, total, totalPages } })
  } catch (error) {
    return reply.status(403).send({ message: 'Acesso permitido apenas a barbeiros.' })
  }
}
