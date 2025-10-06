import { FastifyInstance } from 'fastify'
import { createBarberController } from '../controllers/barbers/create.controller'
import { getBarberProfileController } from '../controllers/barbers/profile.controller'
import { fetchNearbyBarbersController } from '../controllers/barbers/nearby.controller'
import { fetchBarberAvailabilityController } from '../controllers/barbers/availability.controller'
import { updateBarberSpecialtiesController } from '../controllers/barbers/update-specialties.controller'
import { removeBarberController } from '../controllers/barbers/remove-barber.controller'
import { getBarberSpecialtiesController } from '../controllers/barbers/get-specialties.controller'

export async function barbersRoutes(app: FastifyInstance) {
  app.post('/', createBarberController)
  app.get('/:id', getBarberProfileController)
  app.get('/:id/availability', fetchBarberAvailabilityController)
  app.get('/nearby', fetchNearbyBarbersController)
  app.get('/:barberId/specialties', getBarberSpecialtiesController)
  app.put('/:barberId/specialties', updateBarberSpecialtiesController)
  app.delete('/:barberId', removeBarberController)
}