import { FastifyReply, FastifyRequest } from 'fastify'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

  await new Promise<void>((resolve, reject) => {
    const write = fs.createWriteStream(destPath)
    data.file.pipe(write)
    write.on('finish', () => resolve())
    write.on('error', (e) => reject(e))
  })

  const url = `${req.protocol}://${req.headers.host}/uploads/${name}`
  return reply.status(201).send({ url })
}