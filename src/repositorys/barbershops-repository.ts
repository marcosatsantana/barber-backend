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
  features?: string[] // Keep only features filter
}

export type BarbershopWithDetails = Barbershop & {
  distance_in_km: number
  price_from: number | null
  averageRating: number
  review_count?: number
  is_open: boolean
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

  findManyNearby(params: NearbySearchParams & { orderBy?: 'distance' | 'rating' | 'price' | 'popularity'; page?: number; perPage?: number }): Promise<{ items: BarbershopWithDetails[]; total: number }>

  searchNearbyByQuery(params: NearbySearchParams & { query: string; limit: number }): Promise<BarbershopWithDetails[]>
}