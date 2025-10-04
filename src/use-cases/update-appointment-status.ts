import { prisma } from '@/lib/prisma'
import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface UpdateAppointmentStatusRequest {
  userId: string
  appointmentId: string
  action: 'CONFIRM' | 'CANCEL'
}

export class UpdateAppointmentStatusUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({ userId, appointmentId, action }: UpdateAppointmentStatusRequest) {
    const barber = await prisma.barber.findUnique({ where: { userId } })
    if (!barber) {
      throw new Error('Usuário não é barbeiro')
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, barberId: true, status: true, startTime: true },
    })
    if (!appointment || appointment.barberId !== barber.id) {
      throw new Error('Agendamento não encontrado para este barbeiro')
    }

    // Regras simples de transição
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED' || appointment.status === 'NO_SHOW') {
      throw new Error('Não é possível alterar o status deste agendamento')
    }

    const newStatus = action === 'CONFIRM' ? 'CONFIRMED' : 'CANCELLED'
    const updated = await this.appointmentsRepository.updateStatus(appointmentId, newStatus)
    return { appointment: updated }
  }
}
