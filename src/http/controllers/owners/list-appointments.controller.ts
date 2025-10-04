import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
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

  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['SCHEDULEED','SCHEDULED','CONFIRMED','CANCELLED']).optional().transform(v => v === 'SCHEDULEED' ? 'SCHEDULED' : v) as any,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  const { page, perPage, status, date } = querySchema.parse(req.query)

  const useCase = makeListOwnerAppointmentsUseCase()
  const { appointments, total } = await useCase.execute({ ownerId: req.user.sub, page, perPage, status, date })
  const totalPages = Math.ceil(total / perPage)
  return reply.send({ appointments, pagination: { page, perPage, total, totalPages } })
}
