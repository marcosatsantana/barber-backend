import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function barberAppointmentsCalendarController(req: FastifyRequest, reply: FastifyReply) {
  try { await req.jwtVerify() } catch { return reply.status(401).send({ message: 'Não autenticado.' }) }

  const barber = await prisma.barber.findUnique({ where: { userId: req.user.sub } })
  if (!barber) return reply.status(403).send({ message: 'Acesso permitido apenas a barbeiros.' })

  const querySchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }) // YYYY-MM
  const { month } = querySchema.parse(req.query)
  const [y, m] = month.split('-').map((v) => parseInt(v, 10))
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 1)

  const { PrismaAppointmentsRepository } = await import('@/repositorys/prisma/prisma-appointments-repository')
  const repo = new PrismaAppointmentsRepository()
  const data = await repo.getBarberMonthlySummary({ barberId: barber.id, monthStart, monthEnd })
  return reply.send({ days: data })
}

export async function ownerAppointmentsCalendarController(req: FastifyRequest, reply: FastifyReply) {
  try { await req.jwtVerify() } catch { return reply.status(401).send({ message: 'Não autenticado.' }) }
  if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Acesso permitido apenas a donos.' })
  }
  const querySchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) })
  const { month } = querySchema.parse(req.query)
  const [y, m] = month.split('-').map((v) => parseInt(v, 10))
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 1)

  const { PrismaAppointmentsRepository } = await import('@/repositorys/prisma/prisma-appointments-repository')
  const repo = new PrismaAppointmentsRepository()
  const data = await repo.getOwnerMonthlySummary({ ownerId: req.user.sub, monthStart, monthEnd })
  return reply.send({ days: data })
}
