import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function updateBarbershopServicesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const serviceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    durationMin: z.coerce.number().int().positive(),
    priceCents: z.coerce.number().int().positive(),
    isActive: z.boolean().optional(),
  })
  const bodySchema = z.object({ services: z.array(serviceSchema) })

  const { id } = paramsSchema.parse(req.params)
  const { services } = bodySchema.parse(req.body)

  const shop = await prisma.barbershop.findUnique({ where: { id } })
  if (!shop) return reply.status(404).send({ message: 'Barbearia não encontrada' })
  if (shop.ownerId !== req.user.sub) return reply.status(403).send({ message: 'Sem permissão' })

  // Sync strategy: deactivate services not present by id, upsert provided
  const existing = await prisma.service.findMany({ where: { barbershopId: id } })
  const providedIds = new Set(services.filter(s => s.id).map(s => s.id!))

  const ops: any[] = []

  for (const s of services) {
    if (s.id) {
      ops.push(prisma.service.update({ where: { id: s.id }, data: {
        name: s.name,
        description: s.description,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
        isActive: s.isActive ?? true,
      }}))
    } else {
      ops.push(prisma.service.create({ data: {
        barbershopId: id,
        name: s.name,
        description: s.description,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
        isActive: s.isActive ?? true,
      }}))
    }
  }

  const toDeactivate = existing.filter(e => !providedIds.has(e.id)).map(e => e.id)
  if (toDeactivate.length > 0) {
    ops.push(prisma.service.updateMany({ where: { id: { in: toDeactivate } }, data: { isActive: false } }))
  }

  await prisma.$transaction(ops)

  return reply.status(204).send()
}