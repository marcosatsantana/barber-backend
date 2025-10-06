import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function removeBarberController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({
    barberId: z.string().uuid(),
  })

  const { barberId } = paramsSchema.parse(req.params)

  // Check if the authenticated user is the owner of the barbershop
  const userId = (req as any).user?.sub
  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    // Verify that the barber exists and belongs to a barbershop owned by the user
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: { barbershop: true },
    })

    if (!barber) {
      return reply.status(404).send({ message: 'Barbeiro não encontrado.' })
    }

    // Check if the user is the owner of the barbershop
    if (barber.barbershop.ownerId !== userId) {
      return reply.status(403).send({ message: 'Acesso negado.' })
    }

    // Delete the barber and all related data
    await prisma.barberSpecialty.deleteMany({
      where: { barberId },
    })

    await prisma.barberException.deleteMany({
      where: { barberId },
    })

    await prisma.barber.delete({
      where: { id: barberId },
    })

    return reply.status(200).send({ message: 'Barbeiro removido com sucesso.' })
  } catch (error) {
    console.error('Error removing barber:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}