import { FastifyInstance } from 'fastify'
import { barbersRoutes } from './routes/barbers'
import { barbershopsRoutes } from './routes/barbershops'
import { appointmentsRoutes } from './routes/appointments'
import { authRoutes } from './routes/auth'
import { filtersRoutes } from './routes/filters'
import { uploadsRoutes } from './routes/uploads'
import { ownersRoutes } from './routes/owners'
import { operatingHoursRoutes } from './routes/operating-hours'
import { reviewsRoutes } from './routes/reviews'
import { reverseGeocodeRoutes } from './routes/reverse-geocode';
import { favoritesRoutes } from './routes/favorites';
import { notificationsRoutes } from './routes/notifications';
import { specialtiesRoutes } from './routes/specialties';
import { usersRoutes } from './routes/users'

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(filtersRoutes, { prefix: '/filters' })
  app.register(uploadsRoutes, { prefix: '/uploads' })
  app.register(ownersRoutes, { prefix: '/owners' })
  app.register(barbersRoutes, { prefix: '/barbers' })
  app.register(barbershopsRoutes, { prefix: '/barbershops' })
  app.register(appointmentsRoutes, { prefix: '/appointments' })
  app.register(reviewsRoutes, { prefix: '/reviews' })
  app.register(operatingHoursRoutes)
  app.register(reverseGeocodeRoutes);
  app.register(favoritesRoutes);
  app.register(notificationsRoutes);
  app.register(specialtiesRoutes, { prefix: '/specialties' });
  app.register(usersRoutes, { prefix: '/users' })
}