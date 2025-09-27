import { Barbershop } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { BarbershopsRepository, NearbySearchParams } from '../barbershops-repository'

export type BarbershopWithDetails = Barbershop & {
  distance_in_km: number
  price_from: number | null
  averageRating: number
}
export class PrismaBarbershopsRepository implements BarbershopsRepository {
  async create(data: {
    name: string
    address: string
    latitude: number
    longitude: number
    ownerId: string
  }) {
    return prisma.barbershop.create({ data })
  }

  async findById(id: string) {
    return prisma.barbershop.findUnique({
      where: { id },
      include: {
        images: true,
        services: { where: { isActive: true } },
        workingHours: true,
        features: { include: { feature: true } },
        reviews: true,
        barbers: {
          include: {
            user: true,
            specialties: { include: { specialty: true } },
          },
        },
      },
    })
  }

async findManyNearby(
    params: NearbySearchParams,
  ): Promise<BarbershopWithDetails[]> {
    const { latitude, longitude, radiusInKm = 5 } = params

    const barbershops = await prisma.$queryRawUnsafe<BarbershopWithDetails[]>(
      `
      -- CTE para primeiro encontrar as barbearias próximas e calcular a distância
      WITH nearby_barbershops AS (
        SELECT 
          bs.*,
          (6371 * acos(
            cos(radians($1)) * cos(radians(CAST(bs.latitude AS double precision))) *
            cos(radians(CAST(bs.longitude AS double precision)) - radians($2)) +
            sin(radians($1)) * sin(radians(CAST(bs.latitude AS double precision)))
          )) AS distance_in_km
        FROM barbershops bs
        WHERE (6371 * acos(
            cos(radians($1)) * cos(radians(CAST(bs.latitude AS double precision))) *
            cos(radians(CAST(bs.longitude AS double precision)) - radians($2)) +
            sin(radians($1)) * sin(radians(CAST(bs.latitude AS double precision)))
          )) <= $3
      )
      -- Query final que junta as barbearias com serviços E avaliações
      SELECT 
        nbs.*,
        MIN(s.price_cents) AS price_from,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS "averageRating"
      FROM nearby_barbershops nbs
      LEFT JOIN services s ON nbs.id = s.barbershop_id
      LEFT JOIN reviews r ON nbs.id = r.barbershop_id
      GROUP BY 
        nbs.id, 
        nbs.name, 
        nbs.description,
        nbs.phone,
        nbs.whatsapp,
        nbs.street,
        nbs.neighborhood,
        nbs.city,
        nbs."zipCode", -- CORRIGIDO
        nbs.latitude, 
        nbs.longitude,
        nbs."coverImageUrl", -- CORRIGIDO
        nbs.created_at, 
        nbs.updated_at, 
        nbs.owner_id, 
        nbs.distance_in_km
      ORDER BY nbs.distance_in_km;
      `,
      latitude,
      longitude,
      radiusInKm,
    )

    // Garante que os tipos de dados retornados sejam números
    return barbershops.map((shop) => ({
      ...shop,
      price_from: shop.price_from ? Number(shop.price_from) : null,
      averageRating: Number(shop.averageRating),
    }))
  }

}


