import 'dotenv/config'
import { buildApp } from './app'

const app = buildApp()

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const server = app.listen({ port: process.env.PORT ? Number(process.env.PORT) : 3333, host: '0.0.0.0' })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })

// Handle SIGTERM signal for graceful shutdown (important for Render)
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  try {
    await app.close()
    console.log('Server closed successfully')
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    process.exit(1)
  }
})

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  try {
    await app.close()
    console.log('Server closed successfully')
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    process.exit(1)
  }
})