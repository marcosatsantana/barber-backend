import { FastifyInstance } from 'fastify'
import { createAppointmentController } from '../controllers/appointments/create.controller'
import { listMyBarberAppointmentsController } from '../controllers/appointments/list-barber.controller'
import { listMyCustomerAppointmentsController } from '../controllers/appointments/list-customer.controller'
import { cancelAppointmentController, confirmAppointmentController, completeAppointmentController } from '../controllers/appointments/status.controller'
import { barberAppointmentsCalendarController } from '../controllers/appointments/calendar.controller'

export async function appointmentsRoutes(app: FastifyInstance) {
  // Criar agendamento (cliente)
  app.post('/', createAppointmentController)

  // Listar agendamentos do barbeiro autenticado (com paginação e filtros)
  app.get('/barber/me', listMyBarberAppointmentsController)
  // Sumário mensal para calendário do barbeiro
  app.get('/barber/me/calendar', barberAppointmentsCalendarController)

  // Listar agendamentos do cliente autenticado (com paginação e filtros)
  app.get('/customer/me', listMyCustomerAppointmentsController)

  // Ações do barbeiro sobre o agendamento
  app.patch('/:id/confirm', confirmAppointmentController)
  app.patch('/:id/cancel', cancelAppointmentController)
  app.patch('/:id/complete', completeAppointmentController)
}