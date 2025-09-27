import { FastifyInstance } from 'fastify'
import { barbersRoutes } from './routes/barbers'
import { barbershopsRoutes } from './routes/barbershops'
import { appointmentsRoutes } from './routes/appointments'

export async function appRoutes(app: FastifyInstance) {
  app.register(barbersRoutes, { prefix: '/barbers' })
  app.register(barbershopsRoutes, { prefix: '/barbershops' })
  app.register(appointmentsRoutes, { prefix: '/appointments' })
}


