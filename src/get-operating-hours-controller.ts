import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaOperatingHoursRepository } from './prisma-operating-hours-repository'
import { GetOperatingHoursUseCase } from './get-operating-hours-use-case'

export async function getOperatingHours(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getOperatingHoursParamsSchema = z.object({
    barbershopId: z.string().uuid(),
  })

  const { barbershopId } = getOperatingHoursParamsSchema.parse(request.params)

  const operatingHoursRepository = new PrismaOperatingHoursRepository()
  const getOperatingHoursUseCase = new GetOperatingHoursUseCase(
    operatingHoursRepository,
  )

  const { operatingHours } = await getOperatingHoursUseCase.execute({
    barbershopId,
  })

  return reply.status(200).send({ operatingHours })
}