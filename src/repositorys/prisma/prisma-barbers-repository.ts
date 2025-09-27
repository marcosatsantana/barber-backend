import { prisma } from '../../lib/prisma'
import { BarbersRepository, BarberWithShop, NearbySearchParams } from '../barbers-repository'

export class PrismaBarbersRepository implements BarbersRepository {
  async create(data: { userId: string; barbershopId: string }) {
    const barber = await prisma.barber.create({
      data: {
        userId: data.userId,
        barbershopId: data.barbershopId,
      },
    })
    return barber
  }

  async findById(id: string): Promise<BarberWithShop | null> {
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: { barbershop: true },
    })
    return barber as BarberWithShop | null
  }

  async findManyNearby(params: NearbySearchParams): Promise<BarberWithShop[]> {
    const { latitude, longitude, radiusInKm = 5 } = params

const barbers = await prisma.$queryRawUnsafe(
  `
  SELECT 
    b.id as barber_id, 
    b.*, 
    bs.id as barbershop_id, 
    bs.*
  FROM barbers b
  JOIN barbershops bs ON bs.id = b.barbershop_id
  WHERE (6371 * acos(
    cos(radians($1)) * cos(radians(CAST(bs.latitude AS double precision))) *
    cos(radians(CAST(bs.longitude AS double precision)) - radians($2)) +
    sin(radians($1)) * sin(radians(CAST(bs.latitude AS double precision)))
  )) <= $3
  `,
  latitude,
  longitude,
  radiusInKm,
);

const ids = (barbers as any[]).map((r: any) => r.barber_id) as string[];
    if (ids.length === 0) return []

    const results = await prisma.barber.findMany({
      where: { id: { in: ids } },
      include: { barbershop: true },
    })
    return results as BarberWithShop[]
  }
}


