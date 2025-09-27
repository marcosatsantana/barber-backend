import { AppointmentsRepository } from '../repositorys/barbers-repository'
import { BarbersRepository } from '../repositorys/barbers-repository'

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

    return { appointment }
  }

  private async validateService(serviceId: string, barbershopId: string) {
    // This would typically be done through a services repository
    // For now, we'll use a direct prisma call as a fallback
    const { prisma } = await import('../lib/prisma')
    return await prisma.service.findFirst({
      where: {
        id: serviceId,
        barbershopId,
        isActive: true,
      },
    })
  }
}
