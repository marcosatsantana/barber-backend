// Tipos de ambiente e augmentations para Fastify JWT

import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: 'CUSTOMER' | 'OWNER' | 'ADMIN' }
    user: { sub: string; role: 'CUSTOMER' | 'OWNER' | 'ADMIN' }
  }
}


