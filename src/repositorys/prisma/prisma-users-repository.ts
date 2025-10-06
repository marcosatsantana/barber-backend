import { prisma } from '@/lib/prisma'
import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async create(data: {
    name: string
    email: string
    phone?: string | null
    passwordHash: string
    role?: 'CUSTOMER' | 'OWNER' | 'ADMIN'
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        passwordHash: data.passwordHash,
        role: data.role ?? 'CUSTOMER',
        isEmailVerified: false, // POR PADRÃO, EMAIL NÃO VERIFICADO PARA NOVOS USUÁRIOS
      },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }
}