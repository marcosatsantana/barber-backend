import 'dotenv/config'
import { buildApp } from './app'
import cors from '@fastify/cors'

const app = buildApp()

app.register(cors, {
  origin: true, // Libera o acesso para todas as origens
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
