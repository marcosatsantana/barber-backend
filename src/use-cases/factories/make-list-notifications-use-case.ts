import { ListNotificationsUseCase } from '../list-notifications'
import { makePrismaNotificationsRepository } from '@/repositorys/prisma/factories/make-prisma-notifications-repository'

export function makeListNotificationsUseCase() {
  const notificationsRepository = makePrismaNotificationsRepository()
  const listNotificationsUseCase = new ListNotificationsUseCase(notificationsRepository)

  return listNotificationsUseCase
}