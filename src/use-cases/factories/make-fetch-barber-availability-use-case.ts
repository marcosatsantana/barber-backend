import { PrismaBarbersRepository } from '../../repositorys/prisma/prisma-barbers-repository'
import { PrismaAppointmentsRepository } from '../../repositorys/prisma/prisma-appointments-repository'
import { PrismaBarberExceptionsRepository } from '../../repositorys/prisma/prisma-barber-exceptions-repository'
import { FetchBarberAvailabilityUseCase } from '../fetch-barber-availability'

export function makeFetchBarberAvailabilityUseCase() {
  const barbersRepo = new PrismaBarbersRepository()
  const apptsRepo = new PrismaAppointmentsRepository()
  const exceptionsRepo = new PrismaBarberExceptionsRepository()
  return new FetchBarberAvailabilityUseCase(barbersRepo, apptsRepo, exceptionsRepo)
}


