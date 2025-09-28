import { PrismaUsersRepository } from '@/repositorys/prisma/prisma-users-repository'
import { RegisterUserUseCase } from '../register-user'

export function makeRegisterUserUseCase() {
  const usersRepo = new PrismaUsersRepository()
  return new RegisterUserUseCase(usersRepo)
}