import { PrismaBarbershopsRepository } from '../../repositorys/prisma/prisma-barbershops-repository'
import { GetBarbershopUseCase } from '../get-barbershop'

export function makeGetBarbershopUseCase() {
  const repository = new PrismaBarbershopsRepository()
  return new GetBarbershopUseCase(repository)
}


