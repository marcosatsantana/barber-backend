import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function reverseGeocodeController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
  })

  const { lat, lon } = querySchema.parse(req.query)

  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    // Making the request from the server side to avoid CORS issues
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BarberApp/1.0 (https://barber.mkdesigners.com.br)'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch reverse geocode data: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      return reply.status(400).send({ error: data.error })
    }

    const address = data.address || {}
    const city = address.city || address.town || address.village || null
    const state = address.state || address.county || null
    const country = address.country || null
    const formattedAddress = data.display_name || null

    return reply.status(200).send({
      city,
      state,
      country,
      formattedAddress,
    })
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return reply.status(500).send({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    })
  }
}