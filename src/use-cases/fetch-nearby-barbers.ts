import { BarbersRepository } from '../repositorys/barbers-repository'

interface FetchNearbyBarbersRequest {
  latitude: number
  longitude: number
  radiusInKm?: number
}

export class FetchNearbyBarbersUseCase {
  constructor(private barbersRepository: BarbersRepository) {}

  async execute({ latitude, longitude, radiusInKm }: FetchNearbyBarbersRequest) {
    const barbers = await this.barbersRepository.findManyNearby({
      latitude,
      longitude,
      radiusInKm,
    })
    return { barbers }
  }
}


