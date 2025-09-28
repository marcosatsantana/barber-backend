import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function listFiltersController(_req: FastifyRequest, reply: FastifyReply) {
  // Distinct services across all barbershops
  const servicesRows = await prisma.service.findMany({
    where: { isActive: true },
    select: { name: true },
    distinct: ['name'],
    orderBy: { name: 'asc' },
  })
  const services = servicesRows.map((s) => s.name)

  // Features (comodidades) - opcional para futuro
  const featuresRows = await prisma.feature.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const response = {
    distances: [
      { label: 'Até 1km', value: 1 },
      { label: 'Até 3km', value: 3 },
      { label: 'Até 5km', value: 5 },
      { label: 'Até 10km', value: 10 },
    ],
    priceRanges: [
      { label: 'R$ 15 - R$ 30', min: 15, max: 30 },
      { label: 'R$ 30 - R$ 50', min: 30, max: 50 },
      { label: 'R$ 50 - R$ 80', min: 50, max: 80 },
      { label: 'R$ 80+', min: 80, max: 999 },
    ],
    ratings: [
      { label: '5.0', value: 5.0 },
      { label: '4.0+', value: 4.0 },
      { label: '3.0+', value: 3.0 },
    ],
    services,
    features: featuresRows,
  }

  return reply.status(200).send(response)
}