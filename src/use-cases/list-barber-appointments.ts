import { prisma } from '@/lib/prisma'
import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface ListBarberAppointmentsRequest {
  userId: string
}

export class ListBarberAppointmentsUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ userId }: ListBarberAppointmentsRequest) {
    const barber = await prisma.barber.findUnique({ where: { userId } })
    if (!barber) {
      throw new Error('Usuário não é barbeiro')
    }
    const appointments = await this.appointmentsRepository.findByBarberId(barber.id)
    return { appointments }
  }
}
