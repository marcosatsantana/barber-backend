import { prisma } from '@/lib/prisma'
import { AppointmentsRepository } from '@/repositorys/barbers-repository'
import { makeCreateNotificationUseCase } from './factories/make-create-notification-use-case'

interface UpdateAppointmentStatusRequest {
  userId: string
  appointmentId: string
  action: 'CONFIRM' | 'CANCEL' | 'COMPLETE'
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
      include: { customer: true, service: true }
    })
    if (!appointment || appointment.barberId !== barber.id) {
      throw new Error('Agendamento não encontrado para este barbeiro')
    }

    // Regras simples de transição
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED' || appointment.status === 'NO_SHOW') {
      throw new Error('Não é possível alterar o status deste agendamento')
    }

    let newStatus: string;
    switch (action) {
      case 'CONFIRM':
        newStatus = 'CONFIRMED';
        break;
      case 'CANCEL':
        newStatus = 'CANCELLED';
        break;
      case 'COMPLETE':
        newStatus = 'COMPLETED';
        break;
      default:
        throw new Error('Ação inválida');
    }

    const updated = await this.appointmentsRepository.updateStatus(appointmentId, newStatus)

    // Send notification to customer when appointment is confirmed
    if (action === 'CONFIRM') {
      await this.sendConfirmationNotification(appointment)
    }

    return { appointment: updated }
  }

  private async sendConfirmationNotification(appointment: any) {
    try {
      const barber = await prisma.barber.findUnique({
        where: { id: appointment.barberId },
        include: { user: true, barbershop: true }
      })

      if (!barber) {
        return
      }

      const formattedTime = appointment.startTime.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      const createNotificationUseCase = makeCreateNotificationUseCase()
      await createNotificationUseCase.execute({
        userId: appointment.customerId,
        type: 'booking_confirmed',
        title: 'Agendamento confirmado',
        message: `Seu agendamento para ${appointment.service?.name || 'serviço'} na ${barber.barbershop?.name || 'barbearia'} com ${barber.user?.name || 'seu barbeiro'} às ${formattedTime} foi confirmado.`
      })
    } catch (error) {
      console.error('Failed to send confirmation notification:', error)
    }
  }
}