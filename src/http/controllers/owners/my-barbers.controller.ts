import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function myBarbersController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }
  const ownerId = req.user.sub
  const barbers = await prisma.barber.findMany({
    where: { barbershop: { ownerId } },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      barbershop: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return reply.send({ barbers })
}