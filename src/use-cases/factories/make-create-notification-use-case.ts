import { CreateNotificationUseCase } from '../create-notification'
import { makePrismaNotificationsRepository } from '@/repositorys/prisma/factories/make-prisma-notifications-repository'

export function makeCreateNotificationUseCase() {
  const notificationsRepository = makePrismaNotificationsRepository()
  const createNotificationUseCase = new CreateNotificationUseCase(notificationsRepository)

  return createNotificationUseCase
}