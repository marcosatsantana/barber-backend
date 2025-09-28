import { BarbershopsRepository } from '../repositorys/barbershops-repository'

interface FetchNearbyBarbershopsRequest {
  latitude: number
  longitude: number
  radiusInKm?: number
  ratingMin?: number
  priceMin?: number
  priceMax?: number
  services?: string[]
  orderBy?: 'distance' | 'rating' | 'price' | 'popularity'
}

export class FetchNearbyBarbershopsUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute({ latitude, longitude, radiusInKm, ratingMin, priceMin, priceMax, services, orderBy }: FetchNearbyBarbershopsRequest) {
    const barbershops = await this.barbershopsRepository.findManyNearby({
      latitude,
      longitude,
      radiusInKm,
      ratingMin,
      priceMin,
      priceMax,
      services,
      orderBy,
    })
    return { barbershops }
  }
}


