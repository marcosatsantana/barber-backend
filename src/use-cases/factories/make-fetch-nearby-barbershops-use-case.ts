import { PrismaBarbershopsRepository } from '../../repositorys/prisma/prisma-barbershops-repository'
import { FetchNearbyBarbershopsUseCase } from '../fetch-nearby-barbershops'

export function makeFetchNearbyBarbershopsUseCase() {
  const repository = new PrismaBarbershopsRepository()
  return new FetchNearbyBarbershopsUseCase(repository)
}


