import { BarbershopsRepository } from '../repositorys/barbershops-repository'

interface CreateBarbershopRequest {
  name: string
  address: string
  latitude: number
  longitude: number
  ownerId: string
  coverImageUrl?: string | null
  phone?: string | null
  whatsapp?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  description?: string | null
}

export class CreateBarbershopUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute(data: CreateBarbershopRequest) {
    const barbershop = await this.barbershopsRepository.create(data)
    return { barbershop }
  }
}


