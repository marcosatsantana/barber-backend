import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Atualização genérica da barbearia. Por ora, foca em anexar imagens e atualizar campos básicos.
export async function updateBarbershopController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const bodySchema = z.object({
    // Campos básicos opcionais
    name: z.string().optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    street: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    coverImageUrl: z.string().url().optional(),
    // Imagens da galeria
    images: z.array(z.string().url()).optional(),
  })

  const { id } = paramsSchema.parse(req.params)
  const payload = bodySchema.parse(req.body)

  const shop = await prisma.barbershop.findUnique({ where: { id } })
  if (!shop) return reply.status(404).send({ message: 'Barbearia não encontrada' })
  const isOwner = shop.ownerId === (req as any).user?.sub
  const isAdmin = (req as any).user?.role === 'ADMIN'
  if (!isOwner && !isAdmin) return reply.status(403).send({ message: 'Sem permissão' })

  const tx: any[] = []

  const basicUpdate: any = {}
  const basicFields: (keyof typeof payload)[] = [
    'name','description','phone','whatsapp','street','neighborhood','city','state','zipCode','coverImageUrl'
  ]
  for (const key of basicFields) {
    if (typeof payload[key] !== 'undefined') {
      ;(basicUpdate as any)[key] = (payload as any)[key]
    }
  }
  if (Object.keys(basicUpdate).length > 0) {
    tx.push(prisma.barbershop.update({ where: { id }, data: basicUpdate }))
  }

  if (payload.images && payload.images.length > 0) {
    tx.push(prisma.media.createMany({ data: payload.images.map((url) => ({ barbershopId: id, url })) }))
  }

  if (tx.length > 0) await prisma.$transaction(tx)

  return reply.status(204).send()
}