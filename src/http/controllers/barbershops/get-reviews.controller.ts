import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getBarbershopReviewsController(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string().uuid() })
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    perPage: z.coerce.number().int().positive().max(50).default(10),
  })

  const { id } = paramsSchema.parse(req.params)
  const { page, perPage } = querySchema.parse(req.query)

  const [total, items] = await Promise.all([
    prisma.review.count({ where: { barbershopId: id } }),
    prisma.review.findMany({
      where: { barbershopId: id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        Service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])

  const reviews = items.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    user: r.user,
    service: r.Service,
  }))

  return reply.status(200).send({
    reviews,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  })
}




