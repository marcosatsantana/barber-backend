import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateAppointmentStatusUseCase } from '@/use-cases/factories/make-update-appointment-status-use-case'

export async function confirmAppointmentController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const useCase = makeUpdateAppointmentStatusUseCase()
  try {
    const { appointment } = await useCase.execute({ userId: req.user.sub, appointmentId: id, action: 'CONFIRM' })
    return reply.send({ appointment })
  } catch (error) {
    if (error instanceof Error) return reply.status(400).send({ message: error.message })
    return reply.status(500).send({ message: 'Erro interno' })
  }
}

export async function cancelAppointmentController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const useCase = makeUpdateAppointmentStatusUseCase()
  try {
    const { appointment } = await useCase.execute({ userId: req.user.sub, appointmentId: id, action: 'CANCEL' })
    return reply.send({ appointment })
  } catch (error) {
    if (error instanceof Error) return reply.status(400).send({ message: error.message })
    return reply.status(500).send({ message: 'Erro interno' })
  }
}

// New controller for completing appointments
export async function completeAppointmentController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({ id: z.string().uuid() })
  const { id } = paramsSchema.parse(req.params)

  const useCase = makeUpdateAppointmentStatusUseCase()
  try {
    const { appointment } = await useCase.execute({ userId: req.user.sub, appointmentId: id, action: 'COMPLETE' })
    return reply.send({ appointment })
  } catch (error) {
    if (error instanceof Error) return reply.status(400).send({ message: error.message })
    return reply.status(500).send({ message: 'Erro interno' })
  }
}