import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { OperatingHoursRepository } from './operating-hours-repository'

export class PrismaOperatingHoursRepository implements OperatingHoursRepository {
  async findByBarbershopId(barbershopId: string) {
    const operatingHours = await prisma.operatingHours.findMany({
      where: {
        barbershopId,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    })

    return operatingHours
  }

  async upsertMany(data: Prisma.OperatingHoursUncheckedCreateInput[]) {
    await prisma.$transaction(
      data.map((operatingHour) =>
        prisma.operatingHours.upsert({
          where: {
            barbershopId_dayOfWeek: {
              barbershopId: operatingHour.barbershopId,
              dayOfWeek: operatingHour.dayOfWeek,
            },
          },
          update: operatingHour,
          create: operatingHour,
        }),
      ),
    )
  }
}