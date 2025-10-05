import { FastifyInstance } from 'fastify'
import { toggleFavoriteController } from '../controllers/favorites/toggle-favorite.controller'
import { listFavoritesController } from '../controllers/favorites/list-favorites.controller'
import { checkFavoriteController } from '../controllers/favorites/check-favorite.controller'

export async function favoritesRoutes(app: FastifyInstance) {
  app.post('/favorites/toggle', toggleFavoriteController)
  app.get('/favorites', listFavoritesController)
  app.get('/favorites/check/:barbershopId', checkFavoriteController)
}