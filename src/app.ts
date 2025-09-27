import Fastify from 'fastify'
import { appRoutes } from './http/route'

export function buildApp() {
  const app = Fastify()
  app.register(appRoutes)
  return app
}


