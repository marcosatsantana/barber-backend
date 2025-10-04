import { FastifyInstance } from 'fastify'
import { myBarbershopsController } from '@/http/controllers/owners/my-barbershops.controller'
import { myBarbersController } from '@/http/controllers/owners/my-barbers.controller'
import { ownerCreateBarberController } from '@/http/controllers/owners/create-barber.controller'
import { listOwnerAppointmentsController } from '@/http/controllers/owners/list-appointments.controller'
import { ownerAppointmentsCalendarController } from '@/http/controllers/appointments/calendar.controller'

export async function ownersRoutes(app: FastifyInstance) {
  app.get('/me/barbershops', myBarbershopsController)
  app.get('/me/barbers', myBarbersController)
  app.get('/me/appointments', listOwnerAppointmentsController)
  app.get('/me/appointments/calendar', ownerAppointmentsCalendarController)
  app.post('/me/barbers', ownerCreateBarberController)
}
