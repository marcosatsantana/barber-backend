import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeToggleFavoriteUseCase } from '../../../use-cases/factories/make-toggle-favorite-use-case'

export async function toggleFavoriteController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const bodySchema = z.object({
    barbershopId: z.string().uuid(),
  })

  const { barbershopId } = bodySchema.parse(req.body)
  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    const useCase = makeToggleFavoriteUseCase()
    const result = await useCase.execute({ userId, barbershopId })
    
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}