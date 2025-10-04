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

  async updateStatus(appointmentId: string, status: string) {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any },
    })
    return appointment
  }
}

