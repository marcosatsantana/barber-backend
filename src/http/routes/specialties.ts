import { FastifyInstance } from 'fastify'
import { listSpecialtiesController } from '../controllers/specialties/list.controller'

export async function specialtiesRoutes(app: FastifyInstance) {
  app.get('/', listSpecialtiesController)
}