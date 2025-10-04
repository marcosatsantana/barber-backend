import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface ListOwnerAppointmentsRequest {
  ownerId: string
  page: number
  perPage: number
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'
  date?: string // YYYY-MM-DD
}

export class ListOwnerAppointmentsUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ ownerId, page, perPage, status, date }: ListOwnerAppointmentsRequest) {
    let dateFrom: Date | undefined
    let dateTo: Date | undefined
    if (date) {
      const [y, m, d] = date.split('-').map((v) => parseInt(v, 10))
      dateFrom = new Date(y, m - 1, d, 0, 0, 0, 0)
      dateTo = new Date(y, m - 1, d, 23, 59, 59, 999)
    }

    const { items, total } = await this.appointmentsRepository.findByOwnerPaged({
      ownerId,
      page,
      perPage,
      status,
      dateFrom,
      dateTo,
    })
    return { appointments: items, total }
  }
}
