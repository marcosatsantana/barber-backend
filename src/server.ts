import 'dotenv/config'
import { buildApp } from './app'

const app = buildApp()

app
  .listen({ port: process.env.PORT ? Number(process.env.PORT) : 3333, host: '0.0.0.0' })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
