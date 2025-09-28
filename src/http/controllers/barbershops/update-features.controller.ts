import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function updateBarbershopFeaturesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const bodySchema = z.object({ featureIds: z.array(z.string().uuid()) })

  const { id } = paramsSchema.parse(req.params)
  const { featureIds } = bodySchema.parse(req.body)

  // Check ownership
  const shop = await prisma.barbershop.findUnique({ where: { id } })
  if (!shop) return reply.status(404).send({ message: 'Barbearia não encontrada' })
  if (shop.ownerId !== req.user.sub) return reply.status(403).send({ message: 'Sem permissão' })

  await prisma.$transaction([
    prisma.barbershopFeature.deleteMany({ where: { barbershopId: id } }),
    prisma.barbershopFeature.createMany({ data: featureIds.map((fid) => ({ barbershopId: id, featureId: fid })) }),
  ])

  return reply.status(204).send()
}