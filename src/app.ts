import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { appRoutes } from './http/route'

export function buildApp() {
  const app = Fastify()

  // JWT plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
  })

  app.register(appRoutes)
  return app
}

