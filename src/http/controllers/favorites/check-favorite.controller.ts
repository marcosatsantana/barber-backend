import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCheckFavoriteUseCase } from '../../../use-cases/factories/make-check-favorite-use-case'

export async function checkFavoriteController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({
    barbershopId: z.string().uuid(),
  })

  const { barbershopId } = paramsSchema.parse(req.params)
  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    const useCase = makeCheckFavoriteUseCase()
    const result = await useCase.checkFavorite({ userId, barbershopId })
    
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Error checking favorite:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}