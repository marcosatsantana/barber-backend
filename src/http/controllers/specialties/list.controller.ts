import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function listSpecialtiesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const { q } = req.query as { q?: string }

  try {
    const specialties = await prisma.specialty.findMany({
      where: q
        ? {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: {
        name: 'asc',
      },
    })

    return reply.status(200).send({ specialties })
  } catch (error) {
    console.error('Error fetching specialties:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}