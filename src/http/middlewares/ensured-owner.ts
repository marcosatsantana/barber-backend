import { FastifyReply, FastifyRequest } from 'fastify'

export async function ensuredOwner(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (_err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  if (request.user?.role !== 'OWNER' && request.user?.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Acesso permitido apenas a donos.' })
  }
}