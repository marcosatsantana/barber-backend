import { FastifyInstance } from 'fastify'
import { createBarbershopController } from '../controllers/barbershops/create.controller'
import { getBarbershopController } from '../controllers/barbershops/get.controller'
import { fetchNearbyBarbershopsController } from '../controllers/barbershops/nearby.controller'
import { getBarbersFromShopController } from '../controllers/barbershops/get-barbers.controller'
import { getBarbershopReviewsController } from '../controllers/barbershops/get-reviews.controller'

export async function barbershopsRoutes(app: FastifyInstance) {
  app.post('/', createBarbershopController)
  app.get('/nearby', fetchNearbyBarbershopsController)
  app.get('/:id', getBarbershopController)
  app.get('/:id/barbers', getBarbersFromShopController)
  app.get('/:id/reviews', getBarbershopReviewsController)
}


