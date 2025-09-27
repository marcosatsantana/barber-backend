import { FastifyInstance } from 'fastify'
import { createBarberController } from '../controllers/barbers/create.controller'
import { getBarberProfileController } from '../controllers/barbers/profile.controller'
import { fetchNearbyBarbersController } from '../controllers/barbers/nearby.controller'
import { fetchBarberAvailabilityController } from '../controllers/barbers/availability.controller'

export async function barbersRoutes(app: FastifyInstance) {
  app.post('/', createBarberController)
  app.get('/:id', getBarberProfileController)
  app.get('/:id/availability', fetchBarberAvailabilityController)
  app.get('/nearby', fetchNearbyBarbersController)
}


