import { PrismaBarbersRepository } from '../../repositorys/prisma/prisma-barbers-repository'
import { FetchNearbyBarbersUseCase } from '../fetch-nearby-barbers'

export function makeFetchNearbyBarbersUseCase() {
  const repository = new PrismaBarbersRepository()
  const useCase = new FetchNearbyBarbersUseCase(repository)
  return useCase
}


