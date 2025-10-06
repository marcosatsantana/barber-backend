import { Barbershop } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { BarbershopsRepository, BarbershopWithDetails, NearbySearchParams } from '../barbershops-repository'

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
    neighborhood?: string | null
    zipCode?: string | null
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
        neighborhood: data.neighborhood ?? null,
        zipCode: data.zipCode ?? null,
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
    params: NearbySearchParams & { orderBy?: 'distance' | 'rating' | 'price' | 'popularity'; page?: number; perPage?: number },
  ): Promise<{ items: BarbershopWithDetails[]; total: number }> {
    const { latitude, longitude, radiusInKm = 5, ratingMin, priceMin, priceMax, features, orderBy = 'distance', page = 1, perPage = 6 } = params

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
        (
          SELECT MIN(s.price_cents) 
          FROM services s 
          WHERE s.barbershop_id = nbs.id
        ) AS price_from,
        COALESCE(ROUND((
          SELECT AVG(r.rating)::numeric FROM reviews r WHERE r.barbershop_id = nbs.id
        ), 1), 0) AS average_rating,
        (
          SELECT COUNT(*) FROM reviews r WHERE r.barbershop_id = nbs.id
        ) AS review_count,
        -- Calculate open status with timezone adjustment
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM operating_hours oh 
            WHERE oh.barbershop_id = nbs.id 
            AND oh.day_of_week = EXTRACT(DOW FROM (NOW() - INTERVAL '3 hours'))::int
            AND NOT oh.is_closed
            AND (
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 2), '99')
            ) <= (
              EXTRACT(HOUR FROM (NOW() - INTERVAL '3 hours')) * 60 + 
              EXTRACT(MINUTE FROM (NOW() - INTERVAL '3 hours'))
            )
            AND (
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 2), '99')
            ) > (
              EXTRACT(HOUR FROM (NOW() - INTERVAL '3 hours')) * 60 + 
              EXTRACT(MINUTE FROM (NOW() - INTERVAL '3 hours'))
            )
          ) THEN true
          ELSE false
        END AS is_open,
        -- ADICIONADO: Calcula o horário de fechamento se estiver aberto
        CASE
          WHEN EXISTS (
            SELECT 1 FROM operating_hours oh 
            WHERE oh.barbershop_id = nbs.id 
            AND oh.day_of_week = EXTRACT(DOW FROM (NOW() - INTERVAL '3 hours'))::int
            AND NOT oh.is_closed
            AND (
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 2), '99')
            ) <= (
              EXTRACT(HOUR FROM (NOW() - INTERVAL '3 hours')) * 60 + 
              EXTRACT(MINUTE FROM (NOW() - INTERVAL '3 hours'))
            )
            AND (
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 2), '99')
            ) > (
              EXTRACT(HOUR FROM (NOW() - INTERVAL '3 hours')) * 60 + 
              EXTRACT(MINUTE FROM (NOW() - INTERVAL '3 hours'))
            )
          ) THEN (
              SELECT oh.close_time FROM operating_hours oh
              WHERE oh.barbershop_id = nbs.id
              AND oh.day_of_week = EXTRACT(DOW FROM (NOW() - INTERVAL '3 hours'))::int
          )
          ELSE NULL
        END AS open_until
      FROM nearby_barbershops nbs
    `)

    // WHERE filters
    const whereClauses: string[] = []

    // Filter by features
    if (features && features.length > 0) {
      const startIndex = values.length + 1
      const placeholders = features.map((_, idx) => `$${startIndex + idx}`)
      whereClauses.push(`EXISTS (
        SELECT 1 FROM barbershop_features bf 
        JOIN features f ON bf.feature_id = f.id
        WHERE bf.barbershop_id = nbs.id AND f.name IN (${placeholders.join(', ')})
      )`)
      values.push(...features)
    }

    // Filters by rating and price
    if (typeof ratingMin === 'number') {
      const idx = values.length + 1
      whereClauses.push(`COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.barbershop_id = nbs.id), 0) >= $${idx}`)
      values.push(ratingMin)
    }
    if (typeof priceMin === 'number') {
      const idx = values.length + 1
      whereClauses.push(`(SELECT MIN(s.price_cents) FROM services s WHERE s.barbershop_id = nbs.id) >= $${idx}`)
      values.push(Math.round(priceMin * 100))
    }
    if (typeof priceMax === 'number') {
      const idx = values.length + 1
      whereClauses.push(`(SELECT MIN(s.price_cents) FROM services s WHERE s.barbershop_id = nbs.id) <= $${idx}`)
      values.push(Math.round(priceMax * 100))
    }

    if (whereClauses.length > 0) {
      sqlParts.push('WHERE ' + whereClauses.join(' AND '))
    }

    // Preserve base to compute total
    const baseSql = sqlParts.join('\n')

    // Total count query
    const countSql = `SELECT COUNT(*)::int AS total FROM (${baseSql}) as sub`;

    // Order
    switch (orderBy) {
      case 'rating':
        sqlParts.push("ORDER BY COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.barbershop_id = nbs.id), 0) DESC, nbs.distance_in_km ASC")
        break
      case 'price':
        sqlParts.push("ORDER BY (SELECT MIN(s.price_cents) FROM services s WHERE s.barbershop_id = nbs.id) ASC NULLS LAST, nbs.distance_in_km ASC")
        break
      case 'popularity':
        sqlParts.push("ORDER BY (SELECT COUNT(*) FROM reviews r WHERE r.barbershop_id = nbs.id) DESC, nbs.distance_in_km ASC")
        break
      default:
        sqlParts.push('ORDER BY nbs.distance_in_km ASC')
    }

    // Pagination
    sqlParts.push(`LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`)

    const dataSql = sqlParts.join('\n') + ';'

    const [countRows, barbershops] = await Promise.all([
      prisma.$queryRawUnsafe<{ total: number }[]>(countSql, ...values),
      prisma.$queryRawUnsafe<BarbershopWithDetails[]>(
        dataSql,
        ...values,
      ),
    ])

    // Sanitize potential BigInt/Decimal values
    const sanitize = (row: any) => {
      const out: any = {}
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'bigint') {
          out[k] = Number(v)
        } else if (v && typeof v === 'object' && 'toNumber' in (v as any) && typeof (v as any).toNumber === 'function') {
          out[k] = (v as any).toNumber()
        } else {
          out[k] = v as any
        }
      }
      return out
    }

    const sanitized = (barbershops as any[]).map(sanitize)

    const items = sanitized.map((shop: any) => ({
      ...shop,
      price_from: shop.price_from !== null && shop.price_from !== undefined ? Number(shop.price_from) : null,
      averageRating: Number(shop.average_rating ?? shop.averageRating ?? 0),
      reviewCount: typeof shop.review_count !== 'undefined' ? Number(shop.review_count) : undefined,
      is_open: Boolean(shop.is_open ?? shop.is_open ?? false),
      // ADICIONADO: Mapeia o campo open_until para o objeto final
      openUntil: shop.open_until ?? null,
    }))

    const total = countRows?.[0]?.total ?? items.length
    return { items, total }
  }


  async searchNearbyByQuery(params: NearbySearchParams & { query: string; limit: number }) {
    const { latitude, longitude, radiusInKm = 50, query, limit = 10 } = params as any

    const q = `%${query.trim()}%`

    const sql = `
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
      SELECT 
        nbs.*,
        (
          SELECT MIN(s.price_cents) FROM services s WHERE s.barbershop_id = nbs.id
        ) AS price_from,
        COALESCE(ROUND((SELECT AVG(r.rating)::numeric FROM reviews r WHERE r.barbershop_id = nbs.id), 1), 0) AS average_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.barbershop_id = nbs.id) AS review_count,
        -- Calculate open status
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM operating_hours oh 
            WHERE oh.barbershop_id = nbs.id 
            AND oh.day_of_week = EXTRACT(DOW FROM NOW())::int
            AND NOT oh.is_closed
            AND (
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.open_time, ':', 2), '99')
            ) <= (
              EXTRACT(HOUR FROM NOW()) * 60 + 
              EXTRACT(MINUTE FROM NOW())
            )
            AND (
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 1), '99') * 60 + 
              TO_NUMBER(SPLIT_PART(oh.close_time, ':', 2), '99')
            ) > (
              EXTRACT(HOUR FROM NOW()) * 60 + 
              EXTRACT(MINUTE FROM NOW())
            )
          ) THEN true
          ELSE false
        END AS is_open
      FROM nearby_barbershops nbs
      WHERE (
        nbs.name ILIKE $4 OR 
        nbs.description ILIKE $4 OR 
        nbs.neighborhood ILIKE $4
      )
      ORDER BY nbs.distance_in_km ASC
      LIMIT $5
    `

    const rows = await prisma.$queryRawUnsafe<any[]>(sql, latitude, longitude, radiusInKm, q, Math.min(10, Math.max(1, limit)))

    // Sanitize numerics
    const sanitize = (row: any) => {
      const out: any = {}
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'bigint') {
          out[k] = Number(v)
        } else if (v && typeof v === 'object' && 'toNumber' in (v as any)) {
          out[k] = (v as any).toNumber()
        } else {
          out[k] = v as any
        }
      }
      return out
    }

    const sanitized = (rows as any[]).map(sanitize)
    
    return sanitized.map((shop: any) => ({
      ...shop,
      price_from: shop.price_from !== null && shop.price_from !== undefined ? Number(shop.price_from) : null,
      averageRating: Number(shop.average_rating ?? shop.averageRating ?? 0),
      reviewCount: typeof shop.review_count !== 'undefined' ? Number(shop.review_count) : undefined,
      is_open: Boolean(shop.is_open ?? shop.is_open ?? false),
    }))
  }
}
