import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { fastifyStatic } from '@fastify/static'
import path from 'path'
import { appRoutes } from './http/route'

export function buildApp() {
  const app = Fastify()

  // JWT plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
  })

  // CORS plugin
  app.register(cors, {
    origin: '*', // Em produção, restrinja para o seu domínio: 'https://meu-frontend.com'
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })

  // Multipart for file uploads (aumenta limite para 15MB para evitar truncamentos)
  app.register(multipart, {
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  })

  // Static files for uploads
  const uploadsDir = path.join(process.cwd(), 'uploads')
  app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  })

  app.register(appRoutes)
  return app
}
