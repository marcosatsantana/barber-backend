import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateBarberUseCase } from '@/use-cases/factories/make-create-barber-use-case'
import { prisma } from '@/lib/prisma'

export async function ownerCreateBarberController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }
  const ownerId = req.user.sub

  const bodySchema = z.object({
    barbershopId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    userEmail: z.string().email().optional(),
  }).refine((data) => data.userId || data.userEmail, {
    message: 'Informe userId ou userEmail',
    path: ['userId'],
  })

  const { barbershopId, userId, userEmail } = bodySchema.parse(req.body)

  // Verify shop belongs to owner
  const shop = await prisma.barbershop.findFirst({ where: { id: barbershopId, ownerId } })
  if (!shop) return reply.status(403).send({ message: 'Barbearia não pertence ao usuário' })

  // Resolve user
  let resolvedUserId = userId
  if (!resolvedUserId && userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })
    resolvedUserId = user.id
  }

  const useCase = makeCreateBarberUseCase()
  const { barber } = await useCase.execute({ userId: resolvedUserId!, barbershopId })
  return reply.status(201).send({ barber })
}