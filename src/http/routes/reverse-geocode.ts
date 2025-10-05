import { FastifyInstance } from 'fastify'
import { reverseGeocodeController } from '../controllers/reverse-geocode.controller'

export async function reverseGeocodeRoutes(app: FastifyInstance) {
  app.get('/reverse-geocode', reverseGeocodeController)
}