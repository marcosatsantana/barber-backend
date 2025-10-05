import { prisma } from '../../lib/prisma'
import { AppointmentsRepository } from '../barbers-repository'

export class PrismaAppointmentsRepository implements AppointmentsRepository {
  async create(data: {
    customerId: string
    barberId: string
    serviceId: string
    startTime: Date
    endTime: Date
  }) {
    const appointment = await prisma.appointment.create({
      data: {
        customerId: data.customerId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'SCHEDULED',
      },
    })
    return appointment
  }

  async findActivesByBarberBetween(params: { barberId: string; start: Date; end: Date }) {
    const { barberId, start, end } = params
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime: { gt: start, lte: end } },
          { startTime: { lte: start }, endTime: { gte: end } },
        ],
      },
      select: { id: true, startTime: true, endTime: true, status: true },
      orderBy: { startTime: 'asc' },
    })
    return appointments
  }

  async findByBarberId(barberId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { barberId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
      },
      orderBy: { startTime: 'asc' },
    })
    return appointments as any
  }

  async findByBarbershopOwnerId(ownerId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { barber: { barbershop: { ownerId } } },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
        barber: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
            barbershop: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    })
    return appointments as any
  }

  async findById(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
        barber: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
            barbershop: { select: { id: true, name: true } },
          },
        },
      },
    })
    return appointment as any
  }

  async findByBarberPaged(params: { barberId: string; page: number; perPage: number; status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'; dateFrom?: Date; dateTo?: Date; }) {
    const { barberId, page, perPage, status, dateFrom, dateTo } = params
    const where: any = { barberId }
    if (status) where.status = status
    if (dateFrom || dateTo) where.startTime = { gte: dateFrom, lte: dateTo }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ])
    return { items: items as any, total }
  }

  async findByOwnerPaged(params: { ownerId: string; page: number; perPage: number; status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'; dateFrom?: Date; dateTo?: Date; }) {
    const { ownerId, page, perPage, status, dateFrom, dateTo } = params
    const where: any = { barber: { barbershop: { ownerId } } }
    if (status) where.status = status
    if (dateFrom || dateTo) where.startTime = { gte: dateFrom, lte: dateTo }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
          barber: {
            select: {
              id: true,
              user: { select: { id: true, name: true, email: true } },
              barbershop: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ])
    return { items: items as any, total }
  }

  // New method for customer appointments
  async findByCustomerPaged(params: { customerId: string; page: number; perPage: number; status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; dateFrom?: Date; dateTo?: Date; }) {
    const { customerId, page, perPage, status, dateFrom, dateTo } = params
    const where: any = { customerId }
    if (status) where.status = status
    if (dateFrom || dateTo) where.startTime = { gte: dateFrom, lte: dateTo }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, durationMin: true, priceCents: true } },
          barber: {
            select: {
              id: true,
              user: { select: { id: true, name: true, email: true } },
              barbershop: { select: { id: true, name: true } },
            },
          },
          // Include review information to check if appointment has been reviewed
          review: {
            select: {
              id: true
            }
          }
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ])
    return { items: items as any, total }
  }

  async getBarberMonthlySummary(params: { barberId: string; monthStart: Date; monthEnd: Date }) {
    const { barberId, monthStart, monthEnd } = params
    const appts = await prisma.appointment.findMany({
      where: { barberId, startTime: { gte: monthStart, lt: monthEnd } },
      select: { startTime: true },
    })
    const counts = new Map<string, number>()
    for (const a of appts) {
      const d = a.startTime.toISOString().slice(0, 10)
      counts.set(d, (counts.get(d) || 0) + 1)
    }
    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
  }

  async getOwnerMonthlySummary(params: { ownerId: string; monthStart: Date; monthEnd: Date }) {
    const { ownerId, monthStart, monthEnd } = params
    const appts = await prisma.appointment.findMany({
      where: { barber: { barbershop: { ownerId } }, startTime: { gte: monthStart, lt: monthEnd } },
      select: { startTime: true },
    })
    const counts = new Map<string, number>()
    for (const a of appts) {
      const d = a.startTime.toISOString().slice(0, 10)
      counts.set(d, (counts.get(d) || 0) + 1)
    }
    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
  }

  async updateStatus(appointmentId: string, status: string) {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any },
    })
    return appointment
  }
}