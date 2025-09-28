import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function myBarbershopsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }
  const ownerId = req.user.sub
  const barbershops = await prisma.barbershop.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  })
  return reply.send({ barbershops })
}