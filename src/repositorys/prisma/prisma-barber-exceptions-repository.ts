import { prisma } from '../../lib/prisma'
import { BarberExceptionsRepository } from '../barbers-repository'

export class PrismaBarberExceptionsRepository implements BarberExceptionsRepository {
  async findByBarberOnDate(params: { barberId: string; date: Date }) {
    const { barberId, date } = params
    // 'date' já é o início do dia local em UTC; preserve o range de 24h a partir dele
    const startOfDay = new Date(date.getTime())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

    const exceptions = await prisma.barberException.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { id: true, date: true, startTime: true, endTime: true, isBlocked: true },
      orderBy: { startTime: 'asc' },
    })

    return exceptions
  }
}


