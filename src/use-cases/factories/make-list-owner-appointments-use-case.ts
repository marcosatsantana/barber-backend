import { PrismaAppointmentsRepository } from '@/repositorys/prisma/prisma-appointments-repository'
import { ListOwnerAppointmentsUseCase } from '../list-owner-appointments'

export function makeListOwnerAppointmentsUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  return new ListOwnerAppointmentsUseCase(appointmentsRepository)
}
