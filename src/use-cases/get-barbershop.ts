import { BarbershopsRepository } from '../repositorys/barbershops-repository'
import { getDistanceBetweenCoordinates } from '../utils/get-distance-between-coordinates'

type Coordinates = { latitude?: number; longitude?: number }

interface GetBarbershopRequest {
  id: string
  userLocation?: Coordinates
}

export class GetBarbershopUseCase {
  constructor(private barbershopsRepository: BarbershopsRepository) {}

  async execute({ id, userLocation }: GetBarbershopRequest) {
    const shop = await this.barbershopsRepository.findById(id)
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
            shop.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          ).toFixed(1),
        )
      : 0

    // Open status
    const now = new Date()
    const dayOfWeek = now.getDay() // 0-6
    const today = shop.workingHours?.find((w) => w.dayOfWeek === dayOfWeek)
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

    const images = [
      ...(shop.coverImageUrl ? [shop.coverImageUrl] : []),
      ...(shop.images?.map((i) => i.url) ?? []),
    ]

    const features = shop.features?.map((f) => f.feature.name) ?? []

    const services = (shop.services ?? []).filter((s) => s.isActive).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMin: s.durationMin,
      priceCents: s.priceCents,
    }))

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
        isOpen,
        openUntil,
        features,
        workingHours: shop.workingHours ?? [],
        services,
      },
    }
  }
}


