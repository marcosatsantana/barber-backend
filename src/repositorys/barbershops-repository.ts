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
    coverImageUrl?: string | null
    phone?: string | null
    whatsapp?: string | null
    city?: string | null
    state?: string | null
    neighborhood?: string | null
    zipCode?: string | null
    description?: string | null
  }): Promise<Barbershop>

  findById(id: string): Promise<Barbershop | null>

  findManyNearby(params: NearbySearchParams & { orderBy?: 'distance' | 'rating' | 'price' | 'popularity'; page?: number; perPage?: number }): Promise<{ items: Barbershop[]; total: number }>
}


