import { prisma } from '../../lib/prisma'
import { Barbershop } from '@prisma/client'

export interface FavoritesRepository {
  addFavorite(userId: string, barbershopId: string): Promise<void>
  removeFavorite(userId: string, barbershopId: string): Promise<void>
  isFavorite(userId: string, barbershopId: string): Promise<boolean>
  listFavorites(userId: string): Promise<Barbershop[]>
}

export class PrismaFavoritesRepository implements FavoritesRepository {
  async addFavorite(userId: string, barbershopId: string): Promise<void> {
    await prisma.userFavorite.create({
      data: {
        userId,
        barbershopId,
      },
    })
  }

  async removeFavorite(userId: string, barbershopId: string): Promise<void> {
    await prisma.userFavorite.delete({
      where: {
        userId_barbershopId: {
          userId,
          barbershopId,
        },
      },
    })
  }

  async isFavorite(userId: string, barbershopId: string): Promise<boolean> {
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_barbershopId: {
          userId,
          barbershopId,
        },
      },
    })
    return !!favorite
  }

  async listFavorites(userId: string): Promise<Barbershop[]> {
    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId,
      },
      include: {
        barbershop: {
          include: {
            images: true,
            services: { where: { isActive: true } },
            workingHours: true,
            features: { include: { feature: true } },
            reviews: true,
          },
        },
      },
    })

    return favorites.map(fav => fav.barbershop)
  }
}