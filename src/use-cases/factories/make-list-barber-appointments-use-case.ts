import { PrismaAppointmentsRepository } from '@/repositorys/prisma/prisma-appointments-repository'
import { ListBarberAppointmentsUseCase } from '../list-barber-appointments'

export function makeListBarberAppointmentsUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  return new ListBarberAppointmentsUseCase(appointmentsRepository)
}
