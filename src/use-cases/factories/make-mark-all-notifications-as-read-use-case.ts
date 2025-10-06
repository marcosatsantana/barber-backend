import { MarkAllNotificationsAsReadUseCase } from '../mark-all-notifications-as-read'
import { makePrismaNotificationsRepository } from '@/repositorys/prisma/factories/make-prisma-notifications-repository'

export function makeMarkAllNotificationsAsReadUseCase() {
  const notificationsRepository = makePrismaNotificationsRepository()
  const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationsRepository)

  return markAllNotificationsAsReadUseCase
}