import { getOperatingHours } from '@/get-operating-hours-controller'
import { updateOperatingHours } from '@/update-operating-hours-controller'
import { FastifyInstance } from 'fastify'

export async function operatingHoursRoutes(app: FastifyInstance) {
  app.get(
    '/barbershops/:barbershopId/operating-hours',
    getOperatingHours,
  )
  app.put(
    '/barbershops/:barbershopId/operating-hours',
    updateOperatingHours,
  )
  // TODO: Adicionar verificação de autenticação e autorização (ex: apenas o dono da barbearia pode editar)
}