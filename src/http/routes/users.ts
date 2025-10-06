import { FastifyInstance } from 'fastify'
import { sendEmailVerificationController } from '../controllers/users/send-email-verification.controller'
import { verifyEmailCodeController } from '../controllers/users/verify-email-code.controller'

export async function usersRoutes(app: FastifyInstance) {
  // Set a longer timeout for email verification (60 seconds)
  app.post('/send-email-verification', { 
    config: { 
      rateLimit: false 
    }
  }, sendEmailVerificationController)
  
  app.post('/verify-email-code', verifyEmailCodeController)
}