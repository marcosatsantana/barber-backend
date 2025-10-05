import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListCustomerAppointmentsUseCase } from '@/use-cases/factories/make-list-customer-appointments-use-case'

export async function listMyCustomerAppointmentsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  })
  const { page, perPage, status, date } = querySchema.parse(req.query)

  const useCase = makeListCustomerAppointmentsUseCase()
  try {
    const { appointments, total } = await useCase.execute({ customerId: req.user.sub, page, perPage, status, date })
    const totalPages = Math.ceil(total / perPage)
    
    // Map appointments to include review information
    const mappedAppointments = appointments.map(appointment => ({
      ...appointment,
      // Add reviewed property to indicate if appointment has been reviewed
      reviewed: !!appointment.review
    }))
    
    return reply.send({ appointments: mappedAppointments, pagination: { page, perPage, total, totalPages } })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}