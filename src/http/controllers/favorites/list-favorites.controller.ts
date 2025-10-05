import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListFavoritesUseCase } from '../../../use-cases/factories/make-list-favorites-use-case'

export async function listFavoritesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const querySchema = z.object({
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })

  const { latitude, longitude } = querySchema.parse(req.query)
  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    const useCase = makeListFavoritesUseCase()
    const result = await useCase.execute({ 
      userId, 
      userLocation: latitude && longitude ? { latitude, longitude } : undefined 
    })
    
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Error listing favorites:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}