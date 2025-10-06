import { FastifyRequest, FastifyReply } from 'fastify'
import { makeListNotificationsUseCase } from '@/use-cases/factories/make-list-notifications-use-case'

export async function listNotificationsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    const useCase = makeListNotificationsUseCase()
    const { notifications } = await useCase.execute({ userId })
    
    return reply.status(200).send({ notifications })
  } catch (error) {
    console.error('Error listing notifications:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}