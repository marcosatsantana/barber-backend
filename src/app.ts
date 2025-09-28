import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { appRoutes } from './http/route'

export function buildApp() {
  const app = Fastify()

  // JWT plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
  })

  // Multipart for file uploads
  app.register(multipart)

  // Static files for uploads
  const uploadsDir = path.join(process.cwd(), 'uploads')
  app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  })

  app.register(appRoutes)
  return app
}

