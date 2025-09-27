import { FastifyInstance } from 'fastify'
import { createAppointmentController } from '../controllers/appointments/create.controller'

export async function appointmentsRoutes(app: FastifyInstance) {
  app.post('/', createAppointmentController)
}
