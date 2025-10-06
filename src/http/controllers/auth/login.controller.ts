import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeAuthenticateUserUseCase } from '@/use-cases/factories/make-authenticate-user-use-case'

export async function loginController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  try {
    const { email, password } = bodySchema.parse(req.body)

    const useCase = makeAuthenticateUserUseCase()
    const { user } = await useCase.execute({ email, password })

    // Map the role to a valid JWT role
    const jwtRole = user.role === 'BARBER' ? 'CUSTOMER' : user.role;
    const token = await reply.jwtSign({ sub: user.id, role: jwtRole }, { expiresIn: '7d' })

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified // ADICIONADO: campo isEmailVerified
    }

    return reply.send({ user: safeUser, token })
  } catch (_error) {
    return reply.status(401).send({ message: 'Credenciais inválidas.' })
  }
}