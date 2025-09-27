import { BarbershopsRepository } from '../repositorys/barbershops-repository'

interface CreateBarbershopRequest {
  name: string
  address: string
  latitude: number
  longitude: number
  ownerId: string
}

export class CreateBarbershopUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute(data: CreateBarbershopRequest) {
    const barbershop = await this.barbershopsRepository.create(data)
    return { barbershop }
  }
}


