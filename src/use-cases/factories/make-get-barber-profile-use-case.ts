import { PrismaBarbersRepository } from '../../repositorys/prisma/prisma-barbers-repository'
import { GetBarberProfileUseCase } from '../get-barber-profile'

export function makeGetBarberProfileUseCase() {
  const repository = new PrismaBarbersRepository()
  const useCase = new GetBarberProfileUseCase(repository)
  return useCase
}


