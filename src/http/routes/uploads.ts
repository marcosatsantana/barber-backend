import { FastifyInstance } from 'fastify'
import { uploadController } from '@/http/controllers/uploads/upload.controller'

export async function uploadsRoutes(app: FastifyInstance) {
  app.post('/', uploadController)
}