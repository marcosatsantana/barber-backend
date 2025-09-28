import { buildApp } from './app'
import cors from '@fastify/cors'

const app = buildApp()

app.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_DEV_URL,
      process.env.FRONTEND_PROD_URL,
    ]

    // Em desenvolvimento, `origin` pode ser undefined para requisições do mesmo host (ex: Insomnia)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'), false)
  },
})

app
  .listen({ port: 3333, host: '0.0.0.0' })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })


