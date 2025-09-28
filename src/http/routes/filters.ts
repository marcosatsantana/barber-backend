import { FastifyInstance } from 'fastify'
import { listFiltersController } from '@/http/controllers/filters/list.controller'

export async function filtersRoutes(app: FastifyInstance) {
  app.get('/', listFiltersController)
}