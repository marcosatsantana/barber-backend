import { FastifyInstance } from 'fastify'
import { createReviewController } from '../controllers/reviews/create.controller'

export async function reviewsRoutes(app: FastifyInstance) {
  app.post('/', createReviewController)
}