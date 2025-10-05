import { FastifyReply, FastifyRequest } from 'fastify'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { pipeline } from 'stream/promises'

export async function uploadController(req: FastifyRequest, reply: FastifyReply) {
  const data = await req.file()
  if (!data) return reply.status(400).send({ message: 'No file provided' })

  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
  }

  const ext = path.extname(data.filename) || '.bin'
  const name = crypto.randomBytes(16).toString('hex') + ext
  const destPath = path.join(uploadsDir, name)

  try {
    const write = fs.createWriteStream(destPath)
    await pipeline(data.file, write)

    // Se o fastify-multipart sinalizar truncamento por limite, removemos o arquivo e retornamos 413
    // @ts-ignore - propriedade específica do plugin
    if ((data as any).file?.truncated) {
      try { fs.unlinkSync(destPath) } catch {}
      return reply.status(413).send({ message: 'Arquivo muito grande (truncado).' })
    }
  } catch (e) {
    try { fs.unlinkSync(destPath) } catch {}
    throw e
  }

  const url = `${req.protocol}://${req.headers.host}/uploads/${name}`
  return reply.status(201).send({ url })
}