import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function verifyEmailCodeController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const bodySchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
  })

  const { email, code } = bodySchema.parse(req.body)
  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    // Check the code against the database
    const storedCode = await prisma.emailVerificationCode.findUnique({
      where: { userId }
    })
    
    if (!storedCode || storedCode.expiresAt < new Date()) {
      return reply.status(400).send({ message: 'Código expirado ou não encontrado.' })
    }
    
    if (storedCode.code !== code || storedCode.email !== email) {
      return reply.status(400).send({ message: 'Código inválido.' })
    }
    
    // Code is valid, update user's email and mark as verified, then remove the verification code
    await prisma.user.update({
      where: { id: userId },
      data: { 
        email: email,
        isEmailVerified: true // MARCAR EMAIL COMO VERIFICADO
      }
    })
    
    // Remove the verification code
    await prisma.emailVerificationCode.delete({
      where: { userId }
    })
    
    return reply.status(200).send({ 
      message: 'Email verificado com sucesso',
      valid: true
    })
  } catch (error) {
    console.error('Error verifying email code:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}