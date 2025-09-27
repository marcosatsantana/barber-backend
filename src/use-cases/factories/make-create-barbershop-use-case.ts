import { PrismaBarbershopsRepository } from '../../repositorys/prisma/prisma-barbershops-repository'
import { CreateBarbershopUseCase } from '../create-barbershop'

export function makeCreateBarbershopUseCase() {
  const repository = new PrismaBarbershopsRepository()
  return new CreateBarbershopUseCase(repository)
}


