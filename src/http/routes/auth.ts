import { FastifyInstance } from 'fastify'
import { registerController } from '@/http/controllers/auth/register.controller'
import { loginController } from '@/http/controllers/auth/login.controller'
import { googleLoginController } from '@/http/controllers/auth/google-login.controller'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', registerController)
  app.post('/login', loginController)
  app.post('/google-login', googleLoginController)
}