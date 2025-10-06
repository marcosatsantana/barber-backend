import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { makeRegisterUserUseCase } from '@/use-cases/factories/make-register-user-use-case'
import { PrismaUsersRepository } from '@/repositorys/prisma/prisma-users-repository'
import { User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function googleLoginController(req: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    accessToken: z.string(),
  })

  const { accessToken } = bodySchema.parse(req.body)

  try {
    // Get comprehensive user info from Google using the access token
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    )
    
    if (!userInfoResponse.ok) {
      return reply.status(401).send({ message: 'Invalid Google token' })
    }

    const userInfo = await userInfoResponse.json()
    console.log('Google user info:', userInfo) // Log for debugging
    
    const { 
      email, 
      name, 
      picture, 
      given_name, 
      family_name, 
      locale 
    } = userInfo

    if (!email || !name) {
      return reply.status(401).send({ message: 'Invalid Google token data' })
    }

    // Check if user exists in our database
    const usersRepository = new PrismaUsersRepository()
    let user = await usersRepository.findByEmail(email)

    if (!user) {
      // Create new user if doesn't exist
      const registerUseCase = makeRegisterUserUseCase()
      const registerResult = await registerUseCase.execute({
        name: name, // Use full name from Google
        email: email,
        password: 'google_auth_' + Date.now(), // Generate a random password for Google auth
        phone: null,
      })
      user = registerResult.user
    }

    // Update user's avatar if available and not already set
    let finalUser = user
    if (picture && !user.avatarUrl) {
      // Update the user with the avatar URL
      finalUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          avatarUrl: picture,
          isEmailVerified: true // PARA USUÁRIOS GOOGLE, EMAIL JÁ VERIFICADO
        },
      })
    } else if (!user.isEmailVerified) {
      // Se o usuário já existia mas o email não estava verificado, marcar como verificado
      finalUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          isEmailVerified: true
        },
      })
    }

    // Map the role to a valid JWT role
    const jwtRole = finalUser.role === 'BARBER' ? 'CUSTOMER' : finalUser.role;

    // Generate JWT token
    const token = await reply.jwtSign(
      { sub: finalUser.id, role: jwtRole },
      { expiresIn: '7d' }
    )

    const safeUser = {
      id: finalUser.id,
      name: finalUser.name,
      email: finalUser.email,
      phone: finalUser.phone,
      role: finalUser.role,
      avatarUrl: finalUser.avatarUrl || picture, // Use Google picture if user doesn't have avatar
      isEmailVerified: finalUser.isEmailVerified // ADICIONADO: campo isEmailVerified
    }

    return reply.status(200).send({
      user: safeUser,
      token,
    })
  } catch (error) {
    console.error('Google authentication error:', error)
    return reply.status(401).send({ message: 'Google authentication failed' })
  }
}