import { AppointmentsRepository } from '../repositorys/barbers-repository'
import { BarbersRepository } from '../repositorys/barbers-repository'
import { makeCreateNotificationUseCase } from './factories/make-create-notification-use-case'
import { prisma } from '../lib/prisma'

interface CreateAppointmentRequest {
  customerId: string
  barberId: string
  serviceId: string
  startTime: Date
  endTime: Date
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private barbersRepository: BarbersRepository,
  ) {}

  async execute(data: CreateAppointmentRequest) {
    const { customerId, barberId, serviceId, startTime, endTime } = data

    // Validate barber exists
    const barber = await this.barbersRepository.findById(barberId)
    if (!barber) {
      throw new Error('Barber not found')
    }

    // Validate service exists and belongs to the same barbershop
    const service = await this.validateService(serviceId, barber.barbershopId)
    if (!service) {
      throw new Error('Service not found or not available at this barbershop')
    }

    // Validate time slot is not in the past
    const now = new Date()
    if (startTime <= now) {
      throw new Error('Cannot schedule appointment in the past')
    }

    // Validate end time is after start time
    if (endTime <= startTime) {
      throw new Error('End time must be after start time')
    }

    // Validate service duration matches appointment duration
    const appointmentDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (appointmentDuration !== service.durationMin) {
      throw new Error(`Appointment duration must match service duration (${service.durationMin} minutes)`)
    }

    // Check for conflicts with existing appointments
    const conflicts = await this.appointmentsRepository.findActivesByBarberBetween({
      barberId,
      start: startTime,
      end: endTime,
    })

    if (conflicts.length > 0) {
      throw new Error('Time slot is not available')
    }

    // Create the appointment
    const appointment = await this.appointmentsRepository.create({
      customerId,
      barberId,
      serviceId,
      startTime,
      endTime,
    })

    // Send notification to barbershop owner
    await this.sendNotificationToBarbershopOwner(barber.barbershopId, customerId, service.name, startTime)

    return { appointment }
  }

  private async validateService(serviceId: string, barbershopId: string) {
    // This would typically be done through a services repository
    // For now, we'll use a direct prisma call as a fallback
    return await prisma.service.findFirst({
      where: {
        id: serviceId,
        barbershopId,
        isActive: true,
      },
    })
  }

  private async sendNotificationToBarbershopOwner(
    barbershopId: string,
    customerId: string,
    serviceName: string,
    appointmentTime: Date
  ) {
    try {
      // Get barbershop with owner
      const barbershop = await prisma.barbershop.findUnique({
        where: { id: barbershopId },
        include: { owner: true }
      })

      if (!barbershop || !barbershop.owner) {
        return
      }

      // Get customer name
      const customer = await prisma.user.findUnique({
        where: { id: customerId }
      })

      const formattedTime = appointmentTime.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      const createNotificationUseCase = makeCreateNotificationUseCase()
      await createNotificationUseCase.execute({
        userId: barbershop.owner.id,
        type: 'booking_received',
        title: 'Novo agendamento',
        message: `Você recebeu um novo agendamento para ${serviceName} às ${formattedTime} por ${customer?.name || 'um cliente'}.`
      })
    } catch (error) {
      console.error('Failed to send notification to barbershop owner:', error)
    }
  }
}