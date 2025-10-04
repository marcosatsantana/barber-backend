import { FastifyInstance } from 'fastify'
import { createAppointmentController } from '../controllers/appointments/create.controller'
import { listMyBarberAppointmentsController } from '../controllers/appointments/list-barber.controller'
import { cancelAppointmentController, confirmAppointmentController } from '../controllers/appointments/status.controller'

export async function appointmentsRoutes(app: FastifyInstance) {
  // Criar agendamento (cliente)
  app.post('/', createAppointmentController)

  // Listar agendamentos do barbeiro autenticado
  app.get('/barber/me', listMyBarberAppointmentsController)

  // Ações do barbeiro sobre o agendamento
  app.patch('/:id/confirm', confirmAppointmentController)
  app.patch('/:id/cancel', cancelAppointmentController)
}
