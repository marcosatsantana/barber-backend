import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface ListOwnerAppointmentsRequest {
  ownerId: string
}

export class ListOwnerAppointmentsUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ ownerId }: ListOwnerAppointmentsRequest) {
    const appointments = await this.appointmentsRepository.findByBarbershopOwnerId(ownerId)
    return { appointments }
  }
}
