import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function sendEmailVerificationController(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  const bodySchema = z.object({
    email: z.string().email(),
  })

  const { email } = bodySchema.parse(req.body)
  const userId = (req as any).user?.sub

  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado.' })
  }

  try {
    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store the verification code in the database with expiration
    await prisma.emailVerificationCode.upsert({
      where: { userId },
      update: {
        code: verificationCode,
        email: email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
      },
      create: {
        userId,
        code: verificationCode,
        email: email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
      }
    })
    
    // Send email with verification code using Gmail SMTP
    try {
      // Configure Gmail SMTP transporter
      const transporter = nodemailer.createTransport({ // CORRIGIDO: createTransport em vez de createTransporter
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      
      // Send email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Código de Verificação - Barbearia Mapa',
        text: `Seu código de verificação é: ${verificationCode}\n\nEste código expira em 10 minutos.`
      });
      
      console.log(`Verification code sent to ${email}: ${verificationCode}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Continue with the response even if email fails
    }
    
    return reply.status(200).send({ 
      message: 'Código de verificação enviado com sucesso'
    })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}