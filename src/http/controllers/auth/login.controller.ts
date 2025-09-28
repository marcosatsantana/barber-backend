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
    const { passwordHash, createdAt, updatedAt, ...userWithoutPassword } = user

    const token = await reply.jwtSign({ sub: user.id, role: user.role }, { expiresIn: '7d' })
    return reply.send({  user: userWithoutPassword, token })
  } catch (_error) {
    return reply.status(401).send({ message: 'Credenciais inválidas.' })
  }
}