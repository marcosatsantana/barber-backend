import { prisma } from '../../lib/prisma'
import { BarberExceptionsRepository } from '../barbers-repository'

export class PrismaBarberExceptionsRepository implements BarberExceptionsRepository {
  async findByBarberOnDate(params: { barberId: string; date: Date }) {
    const { barberId, date } = params
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0))
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))

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


