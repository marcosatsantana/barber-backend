import { BarbersRepository } from '../repositorys/barbers-repository'

interface GetBarberProfileRequest {
  barberId: string
}

export class GetBarberProfileUseCase {
  constructor(private barbersRepository: BarbersRepository) {}

  async execute({ barberId }: GetBarberProfileRequest) {
    const barber = await this.barbersRepository.findById(barberId)
    if (!barber) return { barber: null }
    return { barber }
  }
}


