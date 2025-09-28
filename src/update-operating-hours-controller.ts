import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaOperatingHoursRepository } from './prisma-operating-hours-repository'
import { UpdateOperatingHoursUseCase } from './update-operating-hours-use-case'

export async function updateOperatingHours(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateOperatingHoursParamsSchema = z.object({
    barbershopId: z.string().uuid(),
  })

  const updateOperatingHoursBodySchema = z.object({
    operatingHours: z.array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        openTime: z.string(),
        closeTime: z.string(),
        isClosed: z.boolean(),
      }),
    ),
  })

  const { barbershopId } = updateOperatingHoursParamsSchema.parse(request.params)
  const { operatingHours } = updateOperatingHoursBodySchema.parse(request.body)

  const operatingHoursRepository = new PrismaOperatingHoursRepository()
  const updateOperatingHoursUseCase = new UpdateOperatingHoursUseCase(
    operatingHoursRepository,
  )

  await updateOperatingHoursUseCase.execute({
    barbershopId,
    operatingHours,
  })

  return reply.status(204).send()
}