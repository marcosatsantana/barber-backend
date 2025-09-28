import { Barbershop } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { BarbershopsRepository, NearbySearchParams } from '../barbershops-repository'

export type BarbershopWithDetails = Barbershop & {
  distance_in_km: number
  price_from: number | null
  averageRating: number
  review_count?: number
}
export class PrismaBarbershopsRepository implements BarbershopsRepository {
  async create(data: {
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
    description?: string | null
  }) {
    return prisma.barbershop.create({
      data: {
        name: data.name,
        street: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        ownerId: data.ownerId,
        coverImageUrl: data.coverImageUrl ?? null,
        phone: data.phone ?? null,
        whatsapp: data.whatsapp ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        description: data.description ?? null,
      },
    })
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
    params: NearbySearchParams & { orderBy?: 'distance' | 'rating' | 'price' | 'popularity' },
  ): Promise<BarbershopWithDetails[]> {
    const { latitude, longitude, radiusInKm = 5, ratingMin, priceMin, priceMax, services, orderBy = 'distance' } = params

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
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
        COUNT(r.id) AS review_count
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
        nbs.state,
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
    switch (orderBy) {
      case 'rating':
        sqlParts.push('ORDER BY COALESCE(AVG(r.rating), 0) DESC, nbs.distance_in_km ASC')
        break
      case 'price':
        sqlParts.push('ORDER BY MIN(s.price_cents) ASC NULLS LAST, nbs.distance_in_km ASC')
        break
      case 'popularity':
        sqlParts.push('ORDER BY COUNT(r.id) DESC, nbs.distance_in_km ASC')
        break
      default:
        sqlParts.push('ORDER BY nbs.distance_in_km ASC')
    }

    const sql = sqlParts.join('\n') + ';'

    const barbershops = await prisma.$queryRawUnsafe<BarbershopWithDetails[]>(
      sql,
      ...values,
    )

    // Sanitize potential BigInt/Decimal values from raw query
    const sanitize = (row: any) => {
      const out: any = {}
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'bigint') {
          out[k] = Number(v)
        } else if (v && typeof v === 'object' && 'toNumber' in (v as any) && typeof (v as any).toNumber === 'function') {
          // Prisma Decimal
          out[k] = (v as any).toNumber()
        } else {
          out[k] = v as any
        }
      }
      return out
    }

    const sanitized = (barbershops as any[]).map(sanitize)

    return sanitized.map((shop: any) => ({
      ...shop,
      price_from: shop.price_from !== null && shop.price_from !== undefined ? Number(shop.price_from) : null,
      averageRating: Number(shop.average_rating ?? shop.averageRating ?? 0),
      reviewCount: typeof shop.review_count !== 'undefined' ? Number(shop.review_count) : undefined,
    }))
  }

}


