import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeMarkNotificationAsReadUseCase } from '@/use-cases/factories/make-mark-notification-as-read-use-case'

export async function markNotificationAsReadController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = paramsSchema.parse(req.params)

  try {
    const useCase = makeMarkNotificationAsReadUseCase()
    await useCase.execute({ notificationId: id })
    
    return reply.status(204).send()
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}