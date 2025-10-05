import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateReviewUseCase } from '@/use-cases/factories/make-create-review-use-case'

export async function createReviewController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const bodySchema = z.object({
    appointmentId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  })

  const { appointmentId, rating, comment } = bodySchema.parse(req.body)

  const useCase = makeCreateReviewUseCase()
  try {
    const { review } = await useCase.execute({ 
      userId: req.user.sub, 
      appointmentId, 
      rating, 
      comment 
    })
    return reply.status(201).send({ review })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}