import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface ListCustomerAppointmentsRequest {
  customerId: string
  page: number
  perPage: number
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  date?: string // YYYY-MM-DD
}

export class ListCustomerAppointmentsUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ customerId, page, perPage, status, date }: ListCustomerAppointmentsRequest) {
    let dateFrom: Date | undefined
    let dateTo: Date | undefined
    if (date) {
      const [y, m, d] = date.split('-').map((v) => parseInt(v, 10))
      dateFrom = new Date(y, m - 1, d, 0, 0, 0, 0)
      dateTo = new Date(y, m - 1, d, 23, 59, 59, 999)
    }

    const { items, total } = await this.appointmentsRepository.findByCustomerPaged({
      customerId,
      page,
      perPage,
      status,
      dateFrom,
      dateTo,
    })
    return { appointments: items, total }
  }
}