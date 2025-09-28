import { Barbershop } from '@prisma/client'

export type Coordinates = {
  latitude: number
  longitude: number
}

export type NearbySearchParams = Coordinates & {
  radiusInKm?: number
  ratingMin?: number
  priceMin?: number
  priceMax?: number
  services?: string[]
}

export interface BarbershopsRepository {
  create(data: {
    name: string
    address: string
    latitude: number
    longitude: number
    ownerId: string
  }): Promise<Barbershop>

  findById(id: string): Promise<Barbershop | null>

  findManyNearby(params: NearbySearchParams & { orderBy?: 'distance' | 'rating' | 'price' | 'popularity' }): Promise<Barbershop[]>
}


