import { prisma } from '@/lib/prisma'
import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface ListBarberAppointmentsRequest {
  userId: string
  page: number
  perPage: number
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'
  date?: string // YYYY-MM-DD
}

export class ListBarberAppointmentsUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ userId, page, perPage, status, date }: ListBarberAppointmentsRequest) {
    const barber = await prisma.barber.findUnique({ where: { userId } })
    if (!barber) {
      throw new Error('Usuário não é barbeiro')
    }

    let dateFrom: Date | undefined
    let dateTo: Date | undefined
    if (date) {
      const [y, m, d] = date.split('-').map((v) => parseInt(v, 10))
      dateFrom = new Date(y, m - 1, d, 0, 0, 0, 0)
      dateTo = new Date(y, m - 1, d, 23, 59, 59, 999)
    }

    const { items, total } = await this.appointmentsRepository.findByBarberPaged({
      barberId: barber.id,
      page,
      perPage,
      status,
      dateFrom,
      dateTo,
    })
    return { appointments: items, total }
  }
}
