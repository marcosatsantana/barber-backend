import { UsersRepository } from '@/repositorys/users-repository'
import bcrypt from 'bcryptjs'

interface RegisterUserRequest {
  name: string
  email: string
  password: string
  phone?: string | null
}

export class RegisterUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ name, email, password, phone }: RegisterUserRequest) {
    const existing = await this.usersRepository.findByEmail(email)
    if (existing) {
      throw new Error('E-mail already in use')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await this.usersRepository.create({
      name,
      email,
      phone: phone ?? null,
      passwordHash,
      role: 'CUSTOMER',
    })

    return { user }
  }
}