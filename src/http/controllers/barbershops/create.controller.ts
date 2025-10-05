import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateBarbershopUseCase } from '../../../use-cases/factories/make-create-barbershop-use-case'

export async function createBarbershopController(req: FastifyRequest, reply: FastifyReply) {
  // ownerId não é mais aceito do body por segurança; usamos o usuário autenticado
  const bodySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    coverImageUrl: z.string().url().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    description: z.string().optional(),
  })

  const data = bodySchema.parse(req.body)
  const ownerId = (req as any).user?.sub // garantido por ensuredOwner
  if (!ownerId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const useCase = makeCreateBarbershopUseCase()
  const { barbershop } = await useCase.execute({ ...data, ownerId })
  return reply.status(201).send({ barbershop })
}

