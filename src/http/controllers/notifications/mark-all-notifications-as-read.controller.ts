import { FastifyRequest, FastifyReply } from 'fastify'
import { makeMarkAllNotificationsAsReadUseCase } from '@/use-cases/factories/make-mark-all-notifications-as-read-use-case'

export async function markAllNotificationsAsReadController(req: FastifyRequest, reply: FastifyReply) {
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
    const useCase = makeMarkAllNotificationsAsReadUseCase()
    await useCase.execute({ userId })
    
    return reply.status(204).send()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}