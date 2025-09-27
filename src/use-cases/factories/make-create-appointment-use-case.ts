import { PrismaAppointmentsRepository } from '../../repositorys/prisma/prisma-appointments-repository'
import { PrismaBarbersRepository } from '../../repositorys/prisma/prisma-barbers-repository'
import { CreateAppointmentUseCase } from '../create-appointment'

export function makeCreateAppointmentUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  const barbersRepository = new PrismaBarbersRepository()
  return new CreateAppointmentUseCase(appointmentsRepository, barbersRepository)
}
