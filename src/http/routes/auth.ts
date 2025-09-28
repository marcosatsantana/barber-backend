import { FastifyInstance } from 'fastify'
import { registerController } from '@/http/controllers/auth/register.controller'
import { loginController } from '@/http/controllers/auth/login.controller'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', registerController)
  app.post('/login', loginController)
}
