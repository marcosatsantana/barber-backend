import { prisma } from '../../lib/prisma'
import { ReviewsRepository } from '../reviews-repository'

export class PrismaReviewsRepository implements ReviewsRepository {
  async create(data: {
    userId: string
    barbershopId: string
    appointmentId?: string
    rating: number
    comment?: string
    serviceId?: string
  }) {
    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        barbershopId: data.barbershopId,
        appointmentId: data.appointmentId,
        rating: data.rating,
        comment: data.comment,
        serviceId: data.serviceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        Service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      userId: review.userId,
      barbershopId: review.barbershopId,
      appointmentId: review.appointmentId,
      serviceId: review.serviceId,
    }
  }

  async findByBarbershopId(params: {
    barbershopId: string
    page: number
    perPage: number
  }) {
    const { barbershopId, page, perPage } = params

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { barbershopId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          Service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.review.count({
        where: { barbershopId },
      }),
    ])

    return {
      items: items.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          avatarUrl: review.user.avatarUrl,
        },
        service: review.Service
          ? {
              id: review.Service.id,
              name: review.Service.name,
            }
          : null,
      })),
      total,
    }
  }

  async findByUserIdAndAppointmentId(params: {
    userId: string
    appointmentId: string
  }) {
    const review = await prisma.review.findFirst({
      where: {
        userId: params.userId,
        appointmentId: params.appointmentId,
      },
    })

    if (!review) return null

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      userId: review.userId,
      barbershopId: review.barbershopId,
      appointmentId: review.appointmentId,
      serviceId: review.serviceId,
    }
  }
}