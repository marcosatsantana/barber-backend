import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeRegisterUserUseCase } from '@/use-cases/factories/make-register-user-use-case'

export async function registerController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
  })

  try {
    const { name, email, password, phone } = bodySchema.parse(req.body)

    const useCase = makeRegisterUserUseCase()
    const { user } = await useCase.execute({ name, email, password, phone })
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

    return reply.status(201).send({ user: safeUser, token })
  } catch (error) {
    if (error instanceof Error && error.message.includes('E-mail')) {
      return reply.status(409).send({ message: 'E-mail já está em uso.' })
    }
    return reply.status(400).send({ message: 'Invalid request' })
  }
}