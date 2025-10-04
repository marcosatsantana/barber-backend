import { PrismaAppointmentsRepository } from '@/repositorys/prisma/prisma-appointments-repository'
import { UpdateAppointmentStatusUseCase } from '../update-appointment-status'

export function makeUpdateAppointmentStatusUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  return new UpdateAppointmentStatusUseCase(appointmentsRepository)
}
