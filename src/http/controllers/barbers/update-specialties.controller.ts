import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function updateBarberSpecialtiesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const paramsSchema = z.object({
    barberId: z.string().uuid(),
  })

  const bodySchema = z.object({
    specialties: z.array(z.string().min(1)).optional(),
  })

  const { barberId } = paramsSchema.parse(req.params)
  const { specialties = [] } = bodySchema.parse(req.body)

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

    // Get all existing specialties from the database
    const existingSpecialties = await prisma.specialty.findMany({
      where: { name: { in: specialties } },
    })

    // Create new specialties that don't exist yet
    const existingSpecialtyNames = existingSpecialties.map(s => s.name)
    const newSpecialtyNames = specialties.filter(name => !existingSpecialtyNames.includes(name))
    
    if (newSpecialtyNames.length > 0) {
      await prisma.specialty.createMany({
        data: newSpecialtyNames.map(name => ({ name })),
        skipDuplicates: true,
      })
    }

    // Get all specialties again (including newly created ones)
    const allSpecialties = await prisma.specialty.findMany({
      where: { name: { in: specialties } },
    })

    // Delete existing barber specialties
    await prisma.barberSpecialty.deleteMany({
      where: { barberId },
    })

    // Create new barber specialties
    if (allSpecialties.length > 0) {
      await prisma.barberSpecialty.createMany({
        data: allSpecialties.map(specialty => ({
          barberId,
          specialtyId: specialty.id,
        })),
      })
    }

    return reply.status(200).send({ message: 'Especialidades atualizadas com sucesso.' })
  } catch (error) {
    console.error('Error updating barber specialties:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}