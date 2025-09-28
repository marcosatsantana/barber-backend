import { User } from '@prisma/client'

export interface UsersRepository {
  create(data: {
    name: string
    email: string
    phone?: string | null
    passwordHash: string
    role?: 'CUSTOMER' | 'OWNER' | 'ADMIN'
  }): Promise<User>

  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}