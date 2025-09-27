import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateAppointmentUseCase } from '../../../use-cases/factories/make-create-appointment-use-case'

export async function createAppointmentController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    customerId: z.string().uuid(),
    barberId: z.string().uuid(),
    serviceId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })

  try {
    const data = bodySchema.parse(req.body)
    
    // Convert string dates to Date objects
    const appointmentData = {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    }

    const useCase = makeCreateAppointmentUseCase()
    const { appointment } = await useCase.execute(appointmentData)
    
    return reply.status(201).send({ appointment })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
