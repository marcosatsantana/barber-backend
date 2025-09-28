import { FastifyInstance } from 'fastify'
import { barbersRoutes } from './routes/barbers'
import { barbershopsRoutes } from './routes/barbershops'
import { appointmentsRoutes } from './routes/appointments'
import { authRoutes } from './routes/auth'
import { filtersRoutes } from './routes/filters'

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(filtersRoutes, { prefix: '/filters' })
  app.register(barbersRoutes, { prefix: '/barbers' })
  app.register(barbershopsRoutes, { prefix: '/barbershops' })
  app.register(appointmentsRoutes, { prefix: '/appointments' })
}

