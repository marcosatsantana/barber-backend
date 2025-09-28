import { UsersRepository } from '@/repositorys/users-repository'
import bcrypt from 'bcryptjs'

interface AuthenticateUserRequest {
  email: string
  password: string
}

export class AuthenticateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ email, password }: AuthenticateUserRequest) {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return { user }
  }
}