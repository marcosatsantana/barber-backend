import { MarkNotificationAsReadUseCase } from '../mark-notification-as-read'
import { makePrismaNotificationsRepository } from '@/repositorys/prisma/factories/make-prisma-notifications-repository'

export function makeMarkNotificationAsReadUseCase() {
  const notificationsRepository = makePrismaNotificationsRepository()
  const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationsRepository)

  return markNotificationAsReadUseCase
}