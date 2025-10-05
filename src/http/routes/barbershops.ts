import { FastifyInstance } from 'fastify'
import { createBarbershopController } from '../controllers/barbershops/create.controller'
import { getBarbershopController } from '../controllers/barbershops/get.controller'
import { fetchNearbyBarbershopsController } from '../controllers/barbershops/nearby.controller'
import { getBarbersFromShopController } from '../controllers/barbershops/get-barbers.controller'
import { getBarbershopReviewsController } from '../controllers/barbershops/get-reviews.controller'
import { ensuredOwner } from '../middlewares/ensured-owner'
import { updateBarbershopFeaturesController } from '../controllers/barbershops/update-features.controller'
import { updateBarbershopServicesController } from '../controllers/barbershops/update-services.controller'
import { updateBarbershopController } from '../controllers/barbershops/update.controller'

export async function barbershopsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [ensuredOwner] }, createBarbershopController)
  app.put('/:id', { preHandler: [ensuredOwner] }, updateBarbershopController)
  app.put('/:id/features', { preHandler: [ensuredOwner] }, updateBarbershopFeaturesController)
  app.put('/:id/services', { preHandler: [ensuredOwner] }, updateBarbershopServicesController)
  app.get('/nearby', fetchNearbyBarbershopsController)
  app.get('/:id', getBarbershopController)
  app.get('/:id/barbers', getBarbersFromShopController)
  app.get('/:id/reviews', getBarbershopReviewsController)
}


