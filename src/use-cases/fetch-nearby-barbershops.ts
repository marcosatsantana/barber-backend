import { BarbershopsRepository } from '../repositorys/barbershops-repository'

interface FetchNearbyBarbershopsRequest {
  latitude: number
  longitude: number
  radiusInKm?: number
}

export class FetchNearbyBarbershopsUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute({ latitude, longitude, radiusInKm }: FetchNearbyBarbershopsRequest) {
    const barbershops = await this.barbershopsRepository.findManyNearby({
      latitude,
      longitude,
      radiusInKm,
    })
    return { barbershops }
  }
}


