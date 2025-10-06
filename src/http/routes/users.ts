import { FastifyInstance } from 'fastify'
import { sendEmailVerificationController } from '../controllers/users/send-email-verification.controller'
import { verifyEmailCodeController } from '../controllers/users/verify-email-code.controller'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/send-email-verification', sendEmailVerificationController)
  app.post('/verify-email-code', verifyEmailCodeController)
}