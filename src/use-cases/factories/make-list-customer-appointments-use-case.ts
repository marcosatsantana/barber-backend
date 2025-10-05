import { PrismaAppointmentsRepository } from '@/repositorys/prisma/prisma-appointments-repository'
import { ListCustomerAppointmentsUseCase } from '@/use-cases/list-customer-appointments'

export function makeListCustomerAppointmentsUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  const useCase = new ListCustomerAppointmentsUseCase(appointmentsRepository)

  return useCase
}