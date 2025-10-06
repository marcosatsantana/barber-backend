import { BarbershopsRepository } from '../repositorys/barbershops-repository'
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

type Coordinates = { latitude?: number; longitude?: number }

interface GetBarbershopRequest {
  id: string
  userLocation?: Coordinates
}

export class GetBarbershopUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute({ id, userLocation }: GetBarbershopRequest) {
    const shop = (await this.barbershopsRepository.findById(
      id,
    )) as unknown as BarbershopWithRelations | null
    if (!shop) return { barbershop: null }

    // Compute distance if provided
    let distance_in_km: number | null = null
    if (
      userLocation?.latitude !== undefined &&
      userLocation?.longitude !== undefined
    ) {
      distance_in_km = getDistanceBetweenCoordinates(
        { latitude: Number(shop.latitude), longitude: Number(shop.longitude) },
        { latitude: userLocation.latitude!, longitude: userLocation.longitude! },
      )
    }

    // Ratings
    const reviewCount = shop.reviews?.length ?? 0
    const averageRating = reviewCount
      ? Number(
          (
            shop.reviews!.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0,
            ) / reviewCount
          ).toFixed(1),
        )
      : 0

    // Open status with UTC-3 timezone adjustment
    const now = new Date()
    // CORREÇÃO: Subtrair 3 horas para o fuso UTC-3 (Horário de Brasília)
    const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const dayOfWeek = brazilTime.getUTCDay() // Usar getUTCDay() para consistência
    const today = shop.workingHours?.find(
      (w: { dayOfWeek: number }) => w.dayOfWeek === dayOfWeek,
    )
    let is_open = false
    let openUntil: string | null = null

    if (today && !today.isClosed) {
      const [oh, om] = today.openTime.split(':').map(Number)
      const [ch, cm] = today.closeTime.split(':').map(Number)
      const minutesNow = brazilTime.getUTCHours() * 60 + brazilTime.getUTCMinutes()
      const minutesOpen = oh * 60 + om
      const minutesClose = ch * 60 + cm
      is_open = minutesNow >= minutesOpen && minutesNow < minutesClose
      openUntil = is_open ? today.closeTime : null
    }

    const images = [
      ...(shop.coverImageUrl ? [shop.coverImageUrl] : []),
      ...(shop.images?.map((i: { url: string }) => i.url) ?? []),
    ]

    const features =
      shop.features?.map((f: { feature: { name: string } }) => f.feature.name) ??
      []

    const services = (shop.services ?? [])
      .filter((s: { isActive: boolean }) => s.isActive)
      .map(
        (s: {
          id: string
          name: string
          description: string | null
          durationMin: number
          priceCents: number
        }) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
        }),
      )

    return {
      barbershop: {
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
        is_open,
        openUntil,
        features,
        workingHours: shop.workingHours ?? [],
        services,
      },
    }
  }
}