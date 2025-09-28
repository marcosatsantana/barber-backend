import { PrismaUsersRepository } from '@/repositorys/prisma/prisma-users-repository'
import { AuthenticateUserUseCase } from '../authenticate-user'

export function makeAuthenticateUserUseCase() {
  const usersRepo = new PrismaUsersRepository()
  return new AuthenticateUserUseCase(usersRepo)
}