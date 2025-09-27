import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getBarbersFromShopController(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const barbers = await prisma.barber.findMany({
    where: { barbershopId: id },
    include: {
      user: true,
      specialties: { include: { specialty: true } },
    },
  })

  const result = barbers.map((b) => ({
    id: b.id,
    name: b.user.name,
    avatarUrl: b.user.avatarUrl,
    bio: b.bio,
    specialties: b.specialties.map((s) => s.specialty.name),
  }))

  return reply.status(200).send({ barbers: result })
}




