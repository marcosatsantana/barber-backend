import { BarbershopsRepository } from '../repositorys/barbershops-repository'

interface FetchNearbyBarbershopsRequest {
  latitude: number
  longitude: number
  radiusInKm?: number
  ratingMin?: number
  priceMin?: number
  priceMax?: number
  features?: string[] // Keep only features filter
  orderBy?: 'distance' | 'rating' | 'price' | 'popularity'
  page?: number
  perPage?: number
}

export class FetchNearbyBarbershopsUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute({ latitude, longitude, radiusInKm, ratingMin, priceMin, priceMax, features, orderBy, page = 1, perPage = 6 }: FetchNearbyBarbershopsRequest) {
    const { items, total } = await this.barbershopsRepository.findManyNearby({
      latitude,
      longitude,
      radiusInKm,
      ratingMin,
      priceMin,
      priceMax,
      features, // Keep only features filter
      orderBy,
      page,
      perPage,
    })
    return { barbershops: items, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } }
  }
}