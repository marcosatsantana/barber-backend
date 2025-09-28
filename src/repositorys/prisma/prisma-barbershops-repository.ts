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
    const { latitude, longitude, radiusInKm = 5, ratingMin, priceMin, priceMax, services } = params

    const sqlParts: string[] = []
    const values: any[] = []

    // Base CTE for nearby
    sqlParts.push(`
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
    `)

    values.push(latitude, longitude, radiusInKm)

    // Start main SELECT
    sqlParts.push(`
      SELECT 
        nbs.*,
        MIN(s.price_cents) AS price_from,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS "averageRating"
      FROM nearby_barbershops nbs
      LEFT JOIN services s ON nbs.id = s.barbershop_id
      LEFT JOIN reviews r ON nbs.id = r.barbershop_id
    `)

    // WHERE filters (applied on joined rows)
    const whereClauses: string[] = []
    if (services && services.length > 0) {
      const startIndex = values.length + 1
      const placeholders = services.map((_, idx) => `$${startIndex + idx}`)
      whereClauses.push(`s.name IN (${placeholders.join(', ')})`)
      values.push(...services)
    }

    if (whereClauses.length > 0) {
      sqlParts.push('WHERE ' + whereClauses.join(' AND '))
    }

    // Group by
    sqlParts.push(`
      GROUP BY 
        nbs.id, 
        nbs.name, 
        nbs.description,
        nbs.phone,
        nbs.whatsapp,
        nbs.street,
        nbs.neighborhood,
        nbs.city,
        nbs."zipCode",
        nbs.latitude, 
        nbs.longitude,
        nbs."coverImageUrl",
        nbs.created_at, 
        nbs.updated_at, 
        nbs.owner_id, 
        nbs.distance_in_km
    `)

    // HAVING filters for aggregates
    const havingClauses: string[] = []
    if (typeof ratingMin === 'number') {
      const idx = values.length + 1
      havingClauses.push(`COALESCE(AVG(r.rating), 0) >= $${idx}`)
      values.push(ratingMin)
    }
    if (typeof priceMin === 'number') {
      const idx = values.length + 1
      havingClauses.push(`MIN(s.price_cents) >= $${idx}`)
      values.push(Math.round(priceMin * 100))
    }
    if (typeof priceMax === 'number') {
      const idx = values.length + 1
      havingClauses.push(`MIN(s.price_cents) <= $${idx}`)
      values.push(Math.round(priceMax * 100))
    }
    if (havingClauses.length > 0) {
      sqlParts.push('HAVING ' + havingClauses.join(' AND '))
    }

    // Order
    sqlParts.push('ORDER BY nbs.distance_in_km')

    const sql = sqlParts.join('\n') + ';'

    const barbershops = await prisma.$queryRawUnsafe<BarbershopWithDetails[]>(
      sql,
      ...values,
    )

    return barbershops.map((shop) => ({
      ...shop,
      price_from: shop.price_from ? Number(shop.price_from) : null,
      averageRating: Number(shop.averageRating),
    }))
  }

}


