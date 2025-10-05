import { FavoritesRepository } from '../repositorys/prisma/prisma-favorites-repository'
import { getDistanceBetweenCoordinates } from '../utils/get-distance-between-coordinates'

// Define the complete Barbershop type with relations
interface BarbershopWithRelations {
  id: string
  name: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  street: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  latitude: any
  longitude: any
  coverImageUrl: string | null
  createdAt: Date
  updatedAt: Date
  ownerId: string
  images: {
    id: string
    url: string
    barbershopId: string
  }[]
  services: {
    id: string
    name: string
    description: string | null
    durationMin: number
    priceCents: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    barbershopId: string
  }[]
  workingHours: {
    id: string
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
    barbershopId: string
  }[]
  features: {
    barbershopId: string
    featureId: string
    feature: {
      id: string
      name: string
    }
  }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    barbershopId: string
    appointmentId: string | null
    serviceId: string | null
  }[]
}

interface BarbershopWithDetails {
  id: string
  name: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  street: string | null
  neighborhood: string | null
  city: string | null
  zipCode: string | null
  latitude: number
  longitude: number
  images: string[]
  averageRating: number
  reviewCount: number
  distance_in_km: number | null
  isOpen: boolean
  openUntil: string | null
  features: string[]
  workingHours: {
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }[]
  services: {
    id: string
    name: string
    description: string | null
    durationMin: number
    priceCents: number
  }[]
  price_from: number
}

interface ListFavoritesRequest {
  userId: string
  userLocation?: {
    latitude: number
    longitude: number
  }
}

interface CheckFavoriteRequest {
  userId: string
  barbershopId: string
}

interface ListFavoritesResponse {
  barbershops: BarbershopWithDetails[]
}

interface CheckFavoriteResponse {
  isFavorite: boolean
}

export class ListFavoritesUseCase {
  constructor(private favoritesRepository: FavoritesRepository) {}

  async execute({ userId, userLocation }: ListFavoritesRequest): Promise<ListFavoritesResponse> {
    const barbershops = await this.favoritesRepository.listFavorites(userId) as unknown as BarbershopWithRelations[]
    
    const barbershopsWithDetails = barbershops.map(shop => {
      // Compute distance if provided
      let distance_in_km: number | null = null
      if (userLocation) {
        distance_in_km = getDistanceBetweenCoordinates(
          { latitude: Number(shop.latitude), longitude: Number(shop.longitude) },
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
        )
      }

      // Calculate ratings
      const reviewCount = shop.reviews?.length ?? 0
      const averageRating = reviewCount
        ? Number(
            (
              shop.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
            ).toFixed(1),
          )
        : 0

      // Calculate price from
      const price_from = shop.services && shop.services.length > 0
        ? Math.min(...shop.services.map((s: { priceCents: number }) => s.priceCents))
        : 0

      // Calculate open status
      const now = new Date()
      const dayOfWeek = now.getDay() // 0-6
      const today = shop.workingHours?.find((w: { dayOfWeek: number }) => w.dayOfWeek === dayOfWeek)
      let isOpen = false
      let openUntil: string | null = null
      if (today && !today.isClosed) {
        const [oh, om] = today.openTime.split(':').map(Number)
        const [ch, cm] = today.closeTime.split(':').map(Number)
        const minutesNow = now.getHours() * 60 + now.getMinutes()
        const minutesOpen = oh * 60 + om
        const minutesClose = ch * 60 + cm
        isOpen = minutesNow >= minutesOpen && minutesNow < minutesClose
        openUntil = isOpen ? today.closeTime : null
      }

      // Process images
      const images = [
        ...(shop.coverImageUrl ? [shop.coverImageUrl] : []),
        ...(shop.images?.map((i: { url: string }) => i.url) ?? []),
      ]

      // Process features
      const features = shop.features?.map((f: { feature: { name: string } }) => f.feature.name) ?? []

      // Process services (only active ones)
      const services = (shop.services ?? []).filter((s: { isActive: boolean }) => s.isActive).map((s: { id: string; name: string; description: string | null; durationMin: number; priceCents: number }) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
      }))

      return {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        phone: shop.phone,
        whatsapp: shop.whatsapp,
        street: shop.street,
        neighborhood: shop.neighborhood,
        city: shop.city,
        zipCode: shop.zipCode,
        latitude: Number(shop.latitude),
        longitude: Number(shop.longitude),
        images,
        averageRating,
        reviewCount,
        distance_in_km,
        isOpen,
        openUntil,
        features,
        workingHours: shop.workingHours ?? [],
        services,
        price_from
      }
    })

    return { barbershops: barbershopsWithDetails }
  }

  async checkFavorite({ userId, barbershopId }: CheckFavoriteRequest): Promise<CheckFavoriteResponse> {
    const isFavorite = await this.favoritesRepository.isFavorite(userId, barbershopId)
    return { isFavorite }
  }
}