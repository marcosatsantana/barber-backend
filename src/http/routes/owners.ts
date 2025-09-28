import { FastifyInstance } from 'fastify'
import { myBarbershopsController } from '@/http/controllers/owners/my-barbershops.controller'
import { myBarbersController } from '@/http/controllers/owners/my-barbers.controller'
import { ownerCreateBarberController } from '@/http/controllers/owners/create-barber.controller'

export async function ownersRoutes(app: FastifyInstance) {
  app.get('/me/barbershops', myBarbershopsController)
  app.get('/me/barbers', myBarbersController)
  app.post('/me/barbers', ownerCreateBarberController)
}