import { PrismaBarbersRepository } from '../../repositorys/prisma/prisma-barbers-repository'
import { CreateBarberUseCase } from '../create-barber'

export function makeCreateBarberUseCase() {
  const repository = new PrismaBarbersRepository()
  const useCase = new CreateBarberUseCase(repository)
  return useCase
}


