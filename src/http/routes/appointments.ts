import { FastifyInstance } from 'fastify'
import { createAppointmentController } from '../controllers/appointments/create.controller'
import { listMyBarberAppointmentsController } from '../controllers/appointments/list-barber.controller'
import { cancelAppointmentController, confirmAppointmentController } from '../controllers/appointments/status.controller'
import { barberAppointmentsCalendarController } from '../controllers/appointments/calendar.controller'

export async function appointmentsRoutes(app: FastifyInstance) {
  // Criar agendamento (cliente)
  app.post('/', createAppointmentController)

  // Listar agendamentos do barbeiro autenticado (com paginação e filtros)
  app.get('/barber/me', listMyBarberAppointmentsController)
  // Sumário mensal para calendário do barbeiro
  app.get('/barber/me/calendar', barberAppointmentsCalendarController)

  // Ações do barbeiro sobre o agendamento
  app.patch('/:id/confirm', confirmAppointmentController)
  app.patch('/:id/cancel', cancelAppointmentController)
}
