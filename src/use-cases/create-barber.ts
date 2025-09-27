import { BarbersRepository } from '../repositorys/barbers-repository'

interface CreateBarberRequest {
  userId: string
  barbershopId: string
}

export class CreateBarberUseCase {
  constructor(private barbersRepository: BarbersRepository) {}

  async execute({ userId, barbershopId }: CreateBarberRequest) {
    const barber = await this.barbersRepository.create({ userId, barbershopId })
    return { barber }
  }
}


